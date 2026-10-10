import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { initCronJobs } from './services/cronService.js';

import amcRoutes from './routes/amcRoutes.js';
import approvalRoutes from './routes/approvalRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import auditlogRoutes from './routes/auditlogRoutes.js';
import authRoutes from './routes/authRoutes.js';
import bugRoutes from './routes/bugRoutes.js';
import changerequestRoutes from './routes/changerequestRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import customfieldRoutes from './routes/customfieldRoutes.js';
import customstatusRoutes from './routes/customstatusRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import domainRoutes from './routes/domainRoutes.js';
import employeeRoutes from './routes/employeeRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import followupRoutes from './routes/followupRoutes.js';
import hostingRoutes from './routes/hostingRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import migrationRoutes from './routes/migrationRoutes.js';
import milestoneRoutes from './routes/milestoneRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import numberingRoutes from './routes/numberingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import payrollRoutes from './routes/payrollRoutes.js';
import portalRoutes from './routes/portalRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import quotationRoutes from './routes/quotationRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import roleRoutes from './routes/roleRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import timeentryRoutes from './routes/timeentryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import websiteRoutes from './routes/websiteRoutes.js';
import workflowRoutes from './routes/workflowRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Register API v1 Endpoints
app.use('/api/v1/amcs', amcRoutes);
app.use('/api/v1/approvals', approvalRoutes);
app.use('/api/v1/attendances', attendanceRoutes);
app.use('/api/v1/auditlogs', auditlogRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/bugs', bugRoutes);
app.use('/api/v1/changerequests', changerequestRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/contacts', contactRoutes);
app.use('/api/v1/contracts', contractRoutes);
app.use('/api/v1/customfields', customfieldRoutes);
app.use('/api/v1/customstatuss', customstatusRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/domains', domainRoutes);
app.use('/api/v1/employees', employeeRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/followups', followupRoutes);
app.use('/api/v1/hostings', hostingRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/leads', leadRoutes);
app.use('/api/v1/leaves', leaveRoutes);
app.use('/api/v1/migration', migrationRoutes);
app.use('/api/v1/milestones', milestoneRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/numberings', numberingRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/payrolls', payrollRoutes);
app.use('/api/v1/portal', portalRoutes);
app.use('/api/v1/projects', projectRoutes);
app.use('/api/v1/quotations', quotationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/settings', settingRoutes);
app.use('/api/v1/tasks', taskRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/timeentrys', timeentryRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/websites', websiteRoutes);
app.use('/api/v1/workflows', workflowRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    errors: process.env.NODE_ENV === 'development' ? [err.stack] : []
  });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(process.env.MONGODB_URI, { family: 4 })
    .then(() => {
      console.log('✅ Connected to MongoDB Atlas');
      initCronJobs();
      app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('❌ MongoDB Connection Error:', err.message);
    });
}

export default app;
