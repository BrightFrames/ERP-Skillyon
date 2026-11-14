-- ========================================================
-- SKILLYON ERP DATABASE SCHEMA (Consolidated & Canonical)
-- ========================================================

-- 1. Multi-Tenant Schools
CREATE TABLE IF NOT EXISTS schools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subscription_status VARCHAR(50) DEFAULT 'TRIAL' CHECK (subscription_status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED')),
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. User Settings (Appearance, Notifications, Preferences)
CREATE TABLE IF NOT EXISTS user_settings (
    email VARCHAR(255) PRIMARY KEY,
    profile JSONB DEFAULT '{}'::jsonb,
    notifications JSONB DEFAULT '{}'::jsonb,
    appearance JSONB DEFAULT '{}'::jsonb
);

-- 3. Classes Table (Created before staff references class_teacher_of)
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    teacher_id INTEGER,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Staff (Super Admin, Admins, Teachers, Support Staff, Security)
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'TEACHER', 'STAFF', 'SECURITY')),
    subject VARCHAR(150),
    join_date DATE DEFAULT CURRENT_DATE,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    is_class_teacher BOOLEAN DEFAULT FALSE,
    class_teacher_of INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    assigned_classes JSONB DEFAULT '[]'::jsonb,
    assigned_subjects JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for classes.teacher_id if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'classes_teacher_id_fkey'
    ) THEN
        ALTER TABLE classes ADD CONSTRAINT classes_teacher_id_fkey 
        FOREIGN KEY (teacher_id) REFERENCES staff(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 5. Students
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    father_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    parent_email VARCHAR(255),
    class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    gender VARCHAR(20) DEFAULT 'Unknown',
    status VARCHAR(20) DEFAULT 'Active',
    avatar TEXT,
    password VARCHAR(255),
    parent_password VARCHAR(255),
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Attendance
CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE(student_id, date)
);

-- 7. Fees Configuration & Management
CREATE TABLE IF NOT EXISTS fees_settings (
    id SERIAL PRIMARY KEY,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    tuition_fee DECIMAL(10, 2) DEFAULT 0,
    admission_fee DECIMAL(10, 2) DEFAULT 0,
    exam_fee DECIMAL(10, 2) DEFAULT 0,
    lab_fee DECIMAL(10, 2) DEFAULT 0,
    sports_fee DECIMAL(10, 2) DEFAULT 0,
    transport_fee DECIMAL(10, 2) DEFAULT 0,
    library_fee DECIMAL(10, 2) DEFAULT 0,
    due_date_monthly INTEGER DEFAULT 10,
    late_fine_amount DECIMAL(10, 2) DEFAULT 0,
    late_fine_type VARCHAR(20) DEFAULT 'FIXED',
    currency VARCHAR(10) DEFAULT 'INR',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fee_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fine_rules (
    id SERIAL PRIMARY KEY,
    rule_type VARCHAR(20) NOT NULL CHECK (rule_type IN ('FIXED', 'PERCENTAGE')),
    rule_value DECIMAL(10, 2) NOT NULL,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fee_assignments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    fee_type_id INTEGER REFERENCES fee_types(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0.00,
    remaining_amount DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Partially Paid', 'Paid', 'Overdue')),
    fine_amount DECIMAL(10, 2) DEFAULT 0.00,
    last_payment_date DATE,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    fee_assignment_id INTEGER REFERENCES fee_assignments(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    fine_paid DECIMAL(10, 2) DEFAULT 0.00,
    payment_status VARCHAR(20) DEFAULT 'Paid' CHECK (payment_status IN ('Pending', 'Partially Paid', 'Paid', 'Failed')),
    payment_method VARCHAR(50),
    payment_date DATE DEFAULT CURRENT_DATE,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoices (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    fee_assignment_id INTEGER REFERENCES fee_assignments(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'Unpaid' CHECK (payment_status IN ('Unpaid', 'Paid', 'Overdue')),
    due_date DATE NOT NULL,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fee_transactions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'Cash',
    transaction_reference VARCHAR(100),
    term VARCHAR(50),
    notes TEXT,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fees (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    term VARCHAR(50) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('UNPAID', 'PARTIAL', 'PAID')),
    due_date DATE NOT NULL,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. Examinations & Academic Marks
CREATE TABLE IF NOT EXISTS marks (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    exam_name VARCHAR(100) NOT NULL,
    score DECIMAL(5, 2) NOT NULL,
    max_score DECIMAL(5, 2) NOT NULL,
    graded_by INTEGER REFERENCES staff(id) ON DELETE SET NULL,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE(student_id, exam_name, subject)
);

-- 9. Assessments & Assignments
CREATE TABLE IF NOT EXISTS assessments (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id INTEGER REFERENCES staff(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) DEFAULT 'Assignment',
    date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    max_score INTEGER DEFAULT 100,
    description TEXT,
    questions JSONB DEFAULT '[]'::jsonb,
    attachment_name VARCHAR(255),
    attachment_data TEXT,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    score INTEGER,
    UNIQUE(assessment_id, student_id)
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
    id SERIAL PRIMARY KEY,
    assessment_id INTEGER REFERENCES assessments(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    file_name VARCHAR(255),
    file_data TEXT,
    file_size VARCHAR(50),
    notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assessment_id, student_id)
);

-- 10. Messages & Communication
CREATE TABLE IF NOT EXISTS parent_messages (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    sender VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
