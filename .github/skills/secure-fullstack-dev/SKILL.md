---
name: secure-fullstack-dev
description: "Workflow for building secure Fullstack ERP features. Specifies Frontend UI (Shadcn + MUI), backend engineering routing, secure endpoints, and debugging steps."
argument-hint: "Describe the feature or component you want to build and secure."
---

# Secure Fullstack Development Workflow

## When to Use
- Building new frontend UI components requiring strict design systems (Shadcn for layout + MUI for complex data components like tables).
- Implementing backend routing with strict Role-Based Access Control (RBAC) in Express/Node.js using PostgreSQL.
- Debugging fullstack connectivity, API auth flows, and performance issues.

## 1. Frontend Engineering (UI/UX)
- **Strict Requirement**: Use **Shadcn UI** for modern standard layouts, forms, and general components. Use **MUI (Material-UI)** specifically for complex data-heavy components (e.g., DataGrid) where Shadcn lacks built-in solutions.
- Keep styling consistent to avoid clashes between Tailwind (Shadcn) and Emotion/styled-components (MUI).
- Ensure all components are fully typed (TypeScript) and manage state properly.

## 2. Backend Engineering & Secure Routing
- Construct robust API endpoints using Express/Node.js with PostgreSQL.
- **Strict Authentication**: Users *cannot* self-register. Accounts must be provisioned by Admins.
- **Security Check**: Every route MUST validate the user session/JWT token. Protect against CSRF and implement rate-limiting where necessary.
- **Role-Based Access Control (RBAC)**: Ensure the endpoint checks if the interacting user has the correct role (e.g., Admin, Teacher, Parent).
- Sanitize and validate all incoming payload data (e.g., using Zod/Joi) to prevent SQL Injection or XSS.

## 3. Debugging Skills
- **Frontend Debugging**: Check browser console for hydration/React errors, monitor Network tab for failed API responses (especially 401/403 status codes), and verify state changes.
- **Backend Debugging**: Verify PostgreSQL connection logs, parse routing middleware to see where requests are dropped, and ensure error handling middleware catches and formats exceptions uniformly.
- **Integration Debugging**: Verify CORS configurations, check auth token transmission (Headers vs Cookies), and trace the request lifecycle from Vite React to Express.

## Quality Criteria
- UI precisely matches Shadcn/MUI standards without conflicting CSS.
- Backend routes are protected; unauthorized roles or unauthenticated users receive 403/401 predictably.
- No sensitive database fields are leaked in API error responses.
