import Lead from '../models/Lead.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Ticket from '../models/Ticket.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';
import Domain from '../models/Domain.js';
import Hosting from '../models/Hosting.js';
import AMC from '../models/AMC.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import EmployeeKPI from '../models/EmployeeKPI.js';

export const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const dateQuery = {};
    if (startDate && endDate) {
      dateQuery.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const [leadsByStatus, leadsBySource, topSalespersons, totalLeads, wonLeads] = await Promise.all([
      Lead.aggregate([
        { $match: { deletedAt: null, ...dateQuery } },
        { $group: { _id: '$status', count: { $sum: 1 }, totalValue: { $sum: '$estimatedBudget' } } }
      ]),
      Lead.aggregate([
        { $match: { deletedAt: null, ...dateQuery } },
        { $group: { _id: '$leadSource', count: { $sum: 1 } } }
      ]),
      Lead.aggregate([
        { $match: { deletedAt: null, salesperson: { $ne: null }, ...dateQuery } },
        { $group: { _id: '$salesperson', count: { $sum: 1 }, totalValue: { $sum: '$estimatedBudget' } } },
        { $sort: { totalValue: -1 } },
        { $limit: 10 }
      ]),
      Lead.countDocuments({ deletedAt: null, ...dateQuery }),
      Lead.countDocuments({ status: 'Won', deletedAt: null, ...dateQuery })
    ]);

    const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        totalLeads,
        wonLeads,
        conversionRate: Number(conversionRate),
        leadsByStatus,
        leadsBySource,
        topSalespersons
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFinanceReport = async (req, res) => {
  try {
    const [invoices, payments, expenses] = await Promise.all([
      Invoice.find({ deletedAt: null }),
      Payment.find({ deletedAt: null }),
      Expense.find({ deletedAt: null })
    ]);

    const totalInvoiced = invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
    const totalCollected = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalOutstanding = invoices.reduce((sum, i) => sum + (i.balance || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = totalCollected - totalExpenses;

    // Aging receivables calculation (0-30, 31-60, 61-90, 90+ days)
    const today = new Date();
    const aging = { days30: 0, days60: 0, days90: 0, days90Plus: 0 };

    invoices.filter(i => i.balance > 0).forEach(inv => {
      const diffDays = Math.floor((today - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) aging.days30 += inv.balance;
      else if (diffDays <= 60) aging.days60 += inv.balance;
      else if (diffDays <= 90) aging.days90 += inv.balance;
      else aging.days90Plus += inv.balance;
    });

    res.json({
      success: true,
      data: {
        totalInvoiced,
        totalCollected,
        totalOutstanding,
        totalExpenses,
        netProfit,
        receivablesAging: aging
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOperationsReport = async (req, res) => {
  try {
    const [projectsByStatus, totalTasks, overdueTasks, totalTickets, slaBreachedTickets] = await Promise.all([
      Project.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Task.countDocuments({ deletedAt: null }),
      Task.countDocuments({ status: { $ne: 'Completed' }, dueDate: { $lt: new Date() }, deletedAt: null }),
      Ticket.countDocuments({ deletedAt: null }),
      Ticket.countDocuments({ status: { $ne: 'Closed' }, priority: 'Urgent', deletedAt: null })
    ]);

    res.json({
      success: true,
      data: {
        projectsByStatus,
        tasks: { totalTasks, overdueTasks },
        support: { totalTickets, slaBreachedTickets }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHrReport = async (req, res) => {
  try {
    const [attendanceCount, leaveRequests, payrollTotal, kpis] = await Promise.all([
      Attendance.countDocuments({ date: { $gte: new Date(new Date().setHours(0,0,0,0)) } }),
      Leave.find({ approvalStatus: 'Pending' }),
      Payroll.aggregate([
        { $group: { _id: '$payrollMonth', totalNetSalary: { $sum: '$netSalary' } } }
      ]),
      EmployeeKPI.find().limit(10)
    ]);

    res.json({
      success: true,
      data: {
        todayAttendanceCount: attendanceCount,
        pendingLeavesCount: leaveRequests.length,
        payrollTotal,
        topKpis: kpis
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
