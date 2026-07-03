import pool from '../db/index.js';

export async function checkAndApplyLateFees() {
  try {
    // 1. Get default fine rule
    const { rows: rules } = await pool.query('SELECT rule_type, rule_value, school_id FROM fine_rules');
    
    // 2. Fetch all non-paid fee assignments
    const { rows: assignments } = await pool.query(
      `SELECT fa.id, fa.student_id, fa.amount, fa.paid_amount, fa.remaining_amount, fa.due_date, fa.status, fa.fine_amount, fa.school_id,
              s.name AS student_name, s.parent_email, c.name AS class_name
       FROM fee_assignments fa
       LEFT JOIN students s ON fa.student_id = s.id
       LEFT JOIN classes c ON s.class_id = c.id
       WHERE fa.status != 'Paid'`
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const fa of assignments) {
      const dueDate = new Date(fa.due_date);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // > 0 if future, < 0 if past

      // A. Reminder Notifications before/on due date
      if (diffDays > 0 && diffDays <= 5) {
        // Send Reminder if not already sent
        const title = 'Reminder: Fee Payment Due';
        const msg = `This is a reminder that the invoice for ${fa.amount} is due on ${fa.due_date.toISOString().split('T')[0]}.`;
        await insertNotificationIfNotExists(fa.parent_email, title, msg, fa.school_id);
      } else if (diffDays === 0) {
        // Send Due Alert on due date
        const title = 'Alert: Fee Payment Due Today';
        const msg = `The invoice for ${fa.amount} is due today, ${fa.due_date.toISOString().split('T')[0]}.`;
        await insertNotificationIfNotExists(fa.parent_email, title, msg, fa.school_id);
      }

      // B. Handle Overdue items (diffDays < 0)
      if (diffDays < 0) {
        let fineToApply = 0.00;
        
        // Find matching fine rule for this school or default to FIXED 100
        const schoolRule = rules.find(r => r.school_id === fa.school_id) || { rule_type: 'FIXED', rule_value: 100.00 };
        
        if (schoolRule.rule_type === 'FIXED') {
          fineToApply = Number(schoolRule.rule_value);
        } else if (schoolRule.rule_type === 'PERCENTAGE') {
          fineToApply = Math.round((Number(fa.amount) * Number(schoolRule.rule_value) / 100.00) * 100) / 100;
        }

        const isTransitioningToOverdue = fa.status !== 'Overdue';
        const isNewFineNeeded = Number(fa.fine_amount) === 0;

        if (isTransitioningToOverdue || isNewFineNeeded) {
          const finalFine = isNewFineNeeded ? fineToApply : Number(fa.fine_amount);
          const newRemaining = (Number(fa.amount) - Number(fa.paid_amount)) + finalFine;

          // Update assignment status, fine, and remaining
          await pool.query(
            `UPDATE fee_assignments 
             SET status = 'Overdue', fine_amount = $1, remaining_amount = $2 
             WHERE id = $3`,
            [finalFine, newRemaining, fa.id]
          );

          // Dispatch notifications
          if (isTransitioningToOverdue) {
            await insertNotification(
              fa.parent_email,
              'Overdue Notice',
              `Your invoice for ${fa.amount} is overdue. Please pay as soon as possible.`,
              fa.school_id
            );
          }
          if (isNewFineNeeded && finalFine > 0) {
            await insertNotification(
              fa.parent_email,
              'Fine Added Notice',
              `A late fee fine penalty of ₹${finalFine} has been added to your overdue fee invoice.`,
              fa.school_id
            );
          }
        }

        // C. Automatically generate invoice document if it doesn't exist
        const { rows: invoiceExist } = await pool.query(
          `SELECT id FROM invoices WHERE fee_assignment_id = $1`,
          [fa.id]
        );

        if (invoiceExist.length === 0) {
          const invNumber = `INV-${fa.id}-${fa.student_id}-${Math.floor(1000 + Math.random() * 9000)}`;
          const finalFineAmount = isNewFineNeeded ? fineToApply : Number(fa.fine_amount);
          const totalDue = Number(fa.amount) + finalFineAmount;

          await pool.query(
            `INSERT INTO invoices (invoice_number, student_id, fee_assignment_id, original_amount, fine_amount, total_due, due_date, payment_status, school_id)
             VALUES ($1, $2, $3, $4, $5, $6, $7, 'Overdue', $8)`,
            [invNumber, fa.student_id, fa.id, fa.amount, finalFineAmount, totalDue, fa.due_date, fa.school_id]
          );
        }
      }
    }
  } catch (err) {
    console.error('Error applying late fees:', err);
  }
}

// Helpers to prevent duplication of notices
async function insertNotificationIfNotExists(email, title, message, schoolId) {
  if (!email) return;
  try {
    const { rows } = await pool.query(
      `SELECT id FROM notifications WHERE recipient_email = $1 AND title = $2 AND created_at >= NOW() - INTERVAL '1 day'`,
      [email, title]
    );
    if (rows.length === 0) {
      await insertNotification(email, title, message, schoolId);
    }
  } catch (err) {
    console.error('Error checking duplicate notification', err);
  }
}

async function insertNotification(email, title, message, schoolId) {
  try {
    // Write parent notification
    if (email) {
      await pool.query(
        `INSERT INTO notifications (recipient_email, title, message, school_id) VALUES ($1, $2, $3, $4)`,
        [email, title, message, schoolId]
      );
    }
    // Also write admin notification
    await pool.query(
      `INSERT INTO notifications (recipient_email, title, message, school_id) VALUES ($1, $2, $3, $4)`,
      ['admin', `[Admin Alert] ${title}`, `${message} (Recipient: ${email || 'Parent'})`, schoolId]
    );
  } catch (err) {
    console.error('Error inserting notification', err);
  }
}
