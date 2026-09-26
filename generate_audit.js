import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDocsDir = path.join(__dirname, '../crm frontend/docs');
if (!fs.existsSync(frontendDocsDir)) fs.mkdirSync(frontendDocsDir, { recursive: true });

const files = {
  'REQUIREMENT_TRACEABILITY_MATRIX.md': `# Requirement Traceability Matrix

| Requirement | PDF Section | Frontend | Backend | Database | API | Workflow | Permission | Notification | Audit | Tests | Status | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Authentication | 4 | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | MISSING | MISSING | MISSING | MISSING | MISSING | PARTIALLY IMPLEMENTED | \`authRoutes.js\`, \`User.js\` |
| RBAC | 5 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | No roles model/middleware found |
| Management Dashboard | 6 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Action Center | 7 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Leads | 9 | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | MISSING | MISSING | MISSING | MISSING | MISSING | PARTIALLY IMPLEMENTED | \`Leads.jsx\`, \`Lead.js\`, \`leadRoutes.js\` |
| Sales Pipeline | 11 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Clients | 12 | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | MISSING | MISSING | MISSING | MISSING | MISSING | PARTIALLY IMPLEMENTED | \`Client.js\` |
| Quotations | 14 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Contracts | 16 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Projects | 20 | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | MISSING | MISSING | MISSING | MISSING | MISSING | PARTIALLY IMPLEMENTED | \`Project.js\`, \`projectRoutes.js\` |
| Tasks | 21 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Milestones | 22 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Bugs | 23 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Websites | 28 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Domains | 31 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Hosting | 32 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Servers | 33 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| SSL | 34 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Backups | 35 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| AMC | 37 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Tickets | 38 | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | MISSING | MISSING | MISSING | MISSING | MISSING | PARTIALLY IMPLEMENTED | \`Ticket.js\`, \`ticketRoutes.js\` |
| Invoices | 44 | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | MISSING | MISSING | MISSING | MISSING | MISSING | PARTIALLY IMPLEMENTED | \`Invoice.js\`, \`invoiceRoutes.js\` |
| Payments | 45 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Expenses | 48 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Vendors | 50 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Employees | 53 | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | MISSING | MISSING | MISSING | MISSING | MISSING | PARTIALLY IMPLEMENTED | \`Employee.js\`, \`employeeRoutes.js\` |
| Attendance | 54 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Leave | 55 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Payroll | 56 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Notifications | 65 | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | MISSING | MISSING | MISSING | MISSING | MISSING | PARTIALLY IMPLEMENTED | \`Notification.js\`, \`notificationRoutes.js\` |
| Reminders | 66 | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | MISSING | |
| Reports | 75 | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | MISSING | MISSING | MISSING | MISSING | MISSING | PARTIALLY IMPLEMENTED | \`reportRoutes.js\` |
| Audit Log | 81 | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | PARTIALLY IMPLEMENTED | MISSING | MISSING | MISSING | MISSING | MISSING | PARTIALLY IMPLEMENTED | \`AuditLog.js\`, \`auditlogRoutes.js\` |
`,
  'FINAL_SYSTEM_AUDIT_REPORT.md': `# Final System Audit Report

## 1. Project Architecture
The system is currently a minimal boilerplate. It is severely incomplete and misses almost all required modules and cross-module integrations.

## 2. Frontend Implementation Status
Highly incomplete. Only a few basic screens (e.g., Leads) exist, and they rely heavily on mock data \`VITE_ENABLE_MOCK_API=true\`.

## 3. Backend Implementation Status
Highly incomplete. A basic Express app exists with a few stubbed controllers and routes. Most controllers lack real business logic, authorization, error handling, or validation.

## 4. Database Implementation Status
Highly incomplete. The Mongoose models (Lead, Client, Ticket, Project, etc.) have only 3-5 fields instead of the 20-30 fields required by the PDF. Major entities like Quotations, Tasks, Domains, Servers, and AMC are entirely missing.

## Missing Requirements
- RBAC (Role-Based Access Control)
- Management / CEO Dashboards
- Action Center
- Complete Sales Pipeline
- Client 360 & Project 360
- Digital Assets (Websites, Apps, Domains, Hosting, Servers, SSL, AMC)
- Finance (Invoices are stubs, Payments, Receivables, Payables, Expenses, GST missing)
- HR (Attendance, Leave, Payroll, KPI missing)
- Workflows and Automation
- Escalations
- Multi-company readiness
- Data Migration

## Production Blockers
1. Almost complete absence of actual business logic.
2. Models are completely insufficient.
3. No RBAC implemented.
4. Hardcoded mock data in the frontend.
5. No proper error handling or validation.
6. Missing 80%+ of the application features.
`,
  'CRITICAL_FIXES.md': `# Critical Fixes

## Issue 1
**Issue:** Missing Core Entities and Fields
**Requirement:** Phase 8-17, Phase 48
**Location:** Backend Models
**Priority:** P0
**Recommended Fix:** Implement all database models required by the PDF with full fields, relationships, indexing, and timestamps.

## Issue 2
**Issue:** Mock Data in Frontend
**Requirement:** Phase 53-54
**Location:** \`Leads.jsx\` and similar pages
**Priority:** P0
**Recommended Fix:** Disable \`VITE_ENABLE_MOCK_API\` and ensure the frontend strictly consumes the backend API. Handle empty states gracefully.

## Issue 3
**Issue:** Lack of Authentication and Authorization (RBAC)
**Requirement:** Phase 4-5
**Location:** Backend \`auth.js\` middleware and frontend Protected Routes.
**Priority:** P0
**Recommended Fix:** Implement JWT-based auth and a robust RBAC middleware that verifies roles and permissions for every API endpoint.
`,
  'API_AUDIT_REPORT.md': `# API Audit Report

## Status
**FAIL** - The API surface area covers less than 10% of the required system.

## Findings
- Most endpoints are just basic CRUD stubs without validation or RBAC.
- Missing endpoints for Quotations, Contacts, Milestones, Bugs, Change Requests, Tasks, etc.
- No standard API response structure used consistently.
`,
  'DATABASE_AUDIT_REPORT.md': `# Database Audit Report

## Status
**FAIL** - The database schema is practically non-existent compared to the requirements.

## Findings
- \`Lead.js\`: Missing industry, source, budget, next follow-up, priority, etc.
- \`Client.js\`: Missing GST, PAN, multiple contacts, industry, account manager, etc.
- Missing entirely: \`Quotations\`, \`Agreements\`, \`Tasks\`, \`Domains\`, \`Websites\`, \`Servers\`, \`Hosting\`, \`Expenses\`, \`Payments\`, \`Attendance\`, \`Leave\`, etc.
`,
  'RBAC_SECURITY_AUDIT.md': `# RBAC & Security Audit Report

## Status
**FAIL**

## Findings
- No Role-Based Access Control implemented.
- \`protect\` middleware exists but only checks for a valid token, not permissions.
- Need to implement Module -> Submodule -> Action permission matrix.
`,
  'END_TO_END_TEST_REPORT.md': `# End-to-End Test Report

## Status
**FAIL**

## Findings
- It is impossible to complete the Master Business Flow (Lead -> Qualification -> ... -> Payment -> Handover) because the intermediate models, APIs, and screens (Quotation, Agreement, Advance Payment, UI/UX, Deployment, Invoice processing) do not exist or are completely disconnected.
`,
  'UAT_CHECKLIST.md': `# UAT Checklist

- [ ] Login and Authentication
- [ ] Role Based Access Control (RBAC)
- [ ] Lead Management
- [ ] Client 360 View
- [ ] Quotations & Approvals
- [ ] Project Management & Tasks
- [ ] Digital Assets (Domains, Hosting, etc.)
- [ ] Support / Helpdesk
- [ ] Finance (Invoices, Payments, Expenses)
- [ ] HR (Employees, Attendance, Leave)
- [ ] Reporting
- [ ] Notifications and Reminders
`,
  'PRODUCTION_READINESS_REPORT.md': `# Production Readiness Report

## Status
**NOT READY**

## Blockers
- The system is in the very early scaffolding stage.
- Complete implementation of all MERN stack layers is required before it can even be considered for staging, let alone production.
`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(frontendDocsDir, filename), content);
}
console.log('Audit files generated.');
