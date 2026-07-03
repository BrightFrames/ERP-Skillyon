import pool from '../db/index.js';
import { checkAndApplyLateFees } from '../utils/feesHelper.js';

// In-memory payment receipts store (fallback only)
const receipts = {};

export const getTodayAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { rows } = await pool.query(
      `SELECT date, status FROM attendance WHERE student_id = $1 AND date = CURRENT_DATE`,
      [studentId]
    );
    res.json({ data: rows[0] || null });
  } catch (err) {
    console.error('getTodayAttendance error', err);
    res.status(500).json({ error: 'Failed to fetch today attendance' });
  }
};

export const getMonthlyAttendance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const month = req.query.month || new Date().toISOString().slice(0,7); // YYYY-MM
    const start = month + '-01';
    const end = new Date(new Date(start).getFullYear(), new Date(start).getMonth()+1, 0).toISOString().slice(0,10);

    const { rows } = await pool.query(
      `SELECT date, status FROM attendance WHERE student_id = $1 AND date BETWEEN $2 AND $3 ORDER BY date ASC`,
      [studentId, start, end]
    );

    // Calculate attendance %
    const total = rows.length;
    const present = rows.filter(r => r.status === 'PRESENT').length;
    const percent = total ? Math.round((present/total)*100) : 0;

    res.json({ data: rows, summary: { total, present, percent } });
  } catch (err) {
    console.error('getMonthlyAttendance error', err);
    res.status(500).json({ error: 'Failed to fetch monthly attendance' });
  }
};

// Retrieve child fees assignments list
export const getFees = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    
    // Automatically transition due transactions & issue late fee invoices
    await checkAndApplyLateFees();

    const { rows } = await pool.query(
      `SELECT 
        fa.id,
        ft.name AS term,
        fa.amount,
        fa.paid_amount,
        fa.remaining_amount,
        fa.due_date,
        fa.status,
        fa.fine_amount,
        fa.last_payment_date
       FROM fee_assignments fa
       LEFT JOIN fee_types ft ON fa.fee_type_id = ft.id
       WHERE fa.student_id = $1 
       ORDER BY fa.due_date ASC`,
      [studentId]
    );
    
    res.json({ data: rows });
  } catch (err) {
    console.error('getFees error', err);
    res.status(500).json({ error: 'Failed to fetch fees list' });
  }
};

// Handle submission checkout process (supports paying one or multiple items together)
export const createPayment = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { term, assignmentIds, amount, method } = req.body; // term is backward fallback for single payment ID
    
    const idsToPay = assignmentIds || (term ? [parseInt(term)] : []);
    if (idsToPay.length === 0) {
      return res.status(400).json({ error: 'No fee assignments specified for payment.' });
    }

    const { rows: student } = await pool.query('SELECT name, parent_email, school_id FROM students WHERE id = $1', [studentId]);
    if (!student[0]) return res.status(404).json({ error: 'Student not found.' });

    const paymentResults = [];
    const today = new Date().toISOString().split('T')[0];

    for (const assignmentId of idsToPay) {
      const { rows: assignRes } = await pool.query(
        `SELECT fa.id, fa.amount, fa.paid_amount, fa.remaining_amount, fa.fine_amount, fa.due_date, ft.name AS fee_name
         FROM fee_assignments fa
         LEFT JOIN fee_types ft ON fa.fee_type_id = ft.id
         WHERE fa.id = $1 AND fa.student_id = $2`,
        [assignmentId, studentId]
      );

      if (assignRes.length === 0) continue;
      const assign = assignRes[0];

      const baseDue = Number(assign.remaining_amount);
      const isOverdue = new Date(assign.due_date) < new Date();
      
      // Calculate how much we pay towards this assignment.
      const paymentAmount = amount && idsToPay.length === 1 ? Number(amount) : baseDue;
      const finePaid = isOverdue ? Number(assign.fine_amount) : 0.00;

      const newPaid = Number(assign.paid_amount) + paymentAmount;
      const newRemaining = Math.max(0, Number(assign.amount) + Number(assign.fine_amount) - newPaid);
      const newStatus = newRemaining === 0 ? 'Paid' : 'Partially Paid';

      // Update fee assignment table
      await pool.query(
        `UPDATE fee_assignments 
         SET paid_amount = $1, remaining_amount = $2, status = $3, last_payment_date = $4 
         WHERE id = $5`,
        [newPaid, newRemaining, newStatus, today, assignmentId]
      );

      // Generate Invoice record update status if fully paid
      if (newStatus === 'Paid') {
        await pool.query(
          `UPDATE invoices SET payment_status = 'Paid' WHERE fee_assignment_id = $1`,
          [assignmentId]
        );
      }

      // Generate receipt number
      const receiptNo = `REC-${assignmentId}-${studentId}-${Date.now().toString().slice(-4)}`;
      
      // Insert Payment record
      const { rows: payRow } = await pool.query(
        `INSERT INTO payments (receipt_number, student_id, fee_assignment_id, amount, fine_paid, payment_status, payment_method, payment_date, school_id)
         VALUES ($1, $2, $3, $4, $5, 'Paid', $6, $7, $8) RETURNING *`,
        [receiptNo, studentId, assignmentId, paymentAmount, finePaid, method || 'UPI', today, student[0].school_id]
      );

      // Log notification
      await pool.query(
        `INSERT INTO notifications (recipient_email, title, message, school_id) 
         VALUES ($1, $2, $3, $4)`,
        [
          student[0].parent_email,
          'Fee Payment Successful',
          `Your payment of ₹${paymentAmount} for ${assign.fee_name} has been processed successfully. Receipt: ${receiptNo}.`,
          student[0].school_id
        ]
      );

      paymentResults.push({
        receipt: payRow[0],
        feeName: assign.fee_name
      });
    }

    // Return receipt payload for UI download
    res.json({
      success: true,
      paymentId: paymentResults[0]?.receipt.receipt_number || `TXN-${Date.now()}`,
      receipt: {
        receiptNumber: paymentResults[0]?.receipt.receipt_number,
        studentName: student[0].name,
        date: today,
        method: method || 'UPI',
        amount: amount || paymentResults.reduce((s, p) => s + Number(p.receipt.amount), 0),
        items: paymentResults.map(p => ({ name: p.feeName, amount: p.receipt.amount }))
      }
    });

  } catch (err) {
    console.error('createPayment error', err);
    res.status(500).json({ error: 'Failed to create payment transaction' });
  }
};

export const getReceipt = async (req, res, next) => {
  try {
    const { paymentId } = req.params;
    const receipt = receipts[paymentId];
    if (!receipt) return res.status(404).json({ error: 'Receipt not found' });
    res.json({ receipt });
  } catch (err) {
    console.error('getReceipt error', err);
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
};

// Retrieve child academic marks for parent dashboard
export const getAcademics = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, subject, exam_name, score, max_score FROM marks WHERE student_id = $1 ORDER BY exam_name DESC, subject ASC`,
      [studentId]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('getAcademics error', err);
    res.status(500).json({ error: 'Failed to fetch academics' });
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { rows } = await pool.query(
      `SELECT id, sender, content, timestamp FROM parent_messages WHERE student_id = $1 ORDER BY timestamp ASC`,
      [studentId]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('getMessages error', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { content } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO parent_messages (student_id, sender, content) VALUES ($1, 'PARENT', $2) RETURNING id, sender, content, timestamp`,
      [studentId, content]
    );
    res.json({ data: rows[0] });
  } catch (err) {
    console.error('sendMessage error', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Retrieve payment transaction history logs for parent portal view
export const getPaymentsHistory = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { rows } = await pool.query(
      `SELECT p.id, p.receipt_number, p.amount, p.fine_paid, p.payment_method, p.payment_date, ft.name AS fee_name
       FROM payments p
       LEFT JOIN fee_assignments fa ON p.fee_assignment_id = fa.id
       LEFT JOIN fee_types ft ON fa.fee_type_id = ft.id
       WHERE p.student_id = $1
       ORDER BY p.payment_date DESC, p.id DESC`,
      [studentId]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('getPaymentsHistory error', err);
    res.status(500).json({ error: 'Failed to fetch payment history logs' });
  }
};

// Process arbitrary custom parent fee payments (Quick Pay)
export const quickPay = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const { feeTypeName, amount, method } = req.body;

    if (!feeTypeName || !amount) {
      return res.status(400).json({ error: 'Fee Type and Amount are required' });
    }

    const { rows: student } = await pool.query('SELECT name, parent_email, school_id FROM students WHERE id = $1', [studentId]);
    if (!student[0]) return res.status(404).json({ error: 'Student not found.' });

    // 1. Get or create the fee type ID
    let typeId;
    const { rows: typeRes } = await pool.query('SELECT id FROM fee_types WHERE name = $1 AND school_id = $2', [feeTypeName, student[0].school_id]);
    if (typeRes.length > 0) {
      typeId = typeRes[0].id;
    } else {
      const { rows: newType } = await pool.query(
        'INSERT INTO fee_types (name, school_id) VALUES ($1, $2) RETURNING id',
        [feeTypeName, student[0].school_id]
      );
      typeId = newType[0].id;
    }

    const today = new Date().toISOString().split('T')[0];

    // 2. Create the fee assignment as Paid
    const { rows: assignRes } = await pool.query(
      `INSERT INTO fee_assignments (student_id, fee_type_id, amount, paid_amount, remaining_amount, due_date, status, last_payment_date, school_id)
       VALUES ($1, $2, $3, $3, 0.00, $4, 'Paid', $4, $5) RETURNING id`,
      [studentId, typeId, parseFloat(amount), today, student[0].school_id]
    );

    const assignmentId = assignRes[0].id;
    const receiptNo = `REC-QP-${assignmentId}-${studentId}-${Date.now().toString().slice(-4)}`;

    // 3. Insert Payment transaction
    const { rows: payRow } = await pool.query(
      `INSERT INTO payments (receipt_number, student_id, fee_assignment_id, amount, payment_status, payment_method, payment_date, school_id)
       VALUES ($1, $2, $3, $4, 'Paid', $5, $6, $7) RETURNING *`,
      [receiptNo, studentId, assignmentId, parseFloat(amount), method || 'UPI', today, student[0].school_id]
    );

    // 4. Create Invoice
    await pool.query(
      `INSERT INTO invoices (invoice_number, student_id, fee_assignment_id, original_amount, fine_amount, total_due, due_date, payment_status, school_id)
       VALUES ($1, $2, $3, $4, 0.00, $4, $5, 'Paid', $6)`,
      [`INV-QP-${assignmentId}`, studentId, assignmentId, parseFloat(amount), today, student[0].school_id]
    );

    // 5. Parent notification
    await pool.query(
      `INSERT INTO notifications (recipient_email, title, message, school_id) 
       VALUES ($1, $2, $3, $4)`,
      [
        student[0].parent_email,
        'Fee Payment Successful',
        `Your quick payment of ₹${amount} for ${feeTypeName} has been processed successfully. Receipt: ${receiptNo}.`,
        student[0].school_id
      ]
    );

    res.json({
      success: true,
      paymentId: receiptNo,
      receipt: {
        receiptNumber: receiptNo,
        studentName: student[0].name,
        date: today,
        method: method || 'UPI',
        amount: parseFloat(amount),
        items: [{ name: feeTypeName, amount: parseFloat(amount) }]
      }
    });

  } catch (err) {
    console.error('Quick pay error:', err);
    res.status(500).json({ error: 'Failed to process quick payment' });
  }
};

// Retrieve alerts notifications lists
export const getNotifications = async (req, res, next) => {
  try {
    const email = req.user.email;
    const { rows } = await pool.query(
      `SELECT id, title, message, status, created_at FROM notifications WHERE recipient_email = $1 ORDER BY created_at DESC`,
      [email]
    );
    res.json({ data: rows });
  } catch (err) {
    console.error('getNotifications error', err);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// Mark notifications read status
export const markNotificationsRead = async (req, res, next) => {
  try {
    const email = req.user.email;
    await pool.query(
      `UPDATE notifications SET status = 'READ' WHERE recipient_email = $1 AND status = 'UNREAD'`,
      [email]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('markNotificationsRead error', err);
    res.status(500).json({ error: 'Failed to mark notifications read' });
  }
};
