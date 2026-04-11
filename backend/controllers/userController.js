// Secure PostgreSQL queries according to secure-fullstack-dev using parameterized values
import pool from '../db/index.js';

/**
 * Controller: Get Profile View
 * Security: Validates session to fetch precise user information
 */
export const getProfile = async (req, res, next) => {
  const userId = req.user.id;

  try {
    // MOCK PostgreSQL Queries: Uses parameterized queries to stop SQL Injection
    // const result = await pool.query('SELECT id, name, email, role_type as role FROM users WHERE id = $1', [userId]);

    // Mocking response to match AccountPage.tsx
    const mockDbResponse = {
      name: "Sarah Jenkins",
      email: "sarah.j@school.edu",
      role: "Teacher",
      className: "Grade 10 - Section B",
      subject: "Mathematics & History",
      joinDate: "Aug 15, 2024"
    };

    res.status(200).json(mockDbResponse);

  } catch (error) {
    console.error("DB Query Error [getProfile]:", error);
    // Passing error to middleware (does not leak db schema structure)
    next(new Error('Failed to retrieve user profile'));
  }
};

/**
 * Controller: Get Server-Side Paginated Activities
 * Features: Pagination & Role-based scoping
 */
export const getActivities = async (req, res, next) => {
  const userId = req.user.id;
  const page = parseInt(req.query.page, 10);
  const limit = parseInt(req.query.limit, 10);
  const offset = page * limit;

  try {
    // PostgreSQL Server Pagination structure:
    // const totalCountQuery = await pool.query('SELECT count(*) FROM user_activities WHERE user_id = $1', [userId]);
    // const dataQuery = await pool.query(
    //   'SELECT id, date, activity, status FROM user_activities WHERE user_id = $1 ORDER BY date DESC LIMIT $2 OFFSET $3',
    //   [userId, limit, offset]
    // );

    // Mocking response to match AccountPage.tsx server pagination
    const fakeDatabase = [
      { id: 1, date: '2026-04-10', activity: 'Updated History Lesson Plan', status: 'Completed' },
      { id: 2, date: '2026-04-09', activity: 'Graded Midterm Exams', status: 'Pending' },
      { id: 3, date: '2026-04-08', activity: 'Parent-Teacher Conference', status: 'Scheduled' },
      { id: 4, date: '2026-04-07', activity: 'Uploaded Math Worksheet', status: 'Completed' },
      { id: 5, date: '2026-04-06', activity: 'Attended Staff Meeting', status: 'Completed' },
      { id: 6, date: '2026-04-05', activity: 'Submitted Term 1 Grades', status: 'Completed' },
      { id: 7, date: '2026-04-04', activity: 'Updated Attendance Record', status: 'Completed' },
    ];

    const data = fakeDatabase.slice(offset, offset + limit);

    res.status(200).json({
      data,
      totalCount: fakeDatabase.length
    });

  } catch (error) {
    console.error("DB Query Error [getActivities]:", error);
    next(new Error('Failed to load user activities.'));
  }
};
