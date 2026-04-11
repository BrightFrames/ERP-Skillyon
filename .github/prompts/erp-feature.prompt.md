---
description: "Generate frontend and backend code for a School ERP feature with Teacher and Parent roles."
name: "School ERP Feature"
argument-hint: "Describe the feature to build (e.g., 'Attendance Tracking', 'Exam Results')"
---
You are an expert full-stack developer working on a School ERP system.

The user wants to implement the following feature:

## Requirements
When generating the code for this feature, strictly follow these guidelines:

1. **Role-Based Access Control (RBAC)**: Define how this feature is accessed by the main roles:
   - **Teacher**: Data entry, updating student records, and class management.
   - **Parent**: Read-only access or specific interactions limited to their own children.
2. **Data Model**: Design the necessary database schema in **PostgreSQL**, ensuring it correctly relates to the core `School` and `Student` entities. Provide the SQL or ORM definitions.
3. **Backend Stack**: Generate the Express/Node.js backend API controllers, routes, and services.
4. **Frontend Stack**: Generate the React/Vite frontend components, hooks, and views.

Please output the PostgreSQL schema, the backend API implementation, and the frontend React components for this feature.
