import Lead from '../models/Lead.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';
import Domain from '../models/Domain.js';
import Hosting from '../models/Hosting.js';
import AMC from '../models/AMC.js';
import Ticket from '../models/Ticket.js';
import Task from '../models/Task.js';
import Approval from '../models/Approval.js';
import FollowUp from '../models/FollowUp.js';
import CreditNote from '../models/CreditNote.js';

export const getManagementMetrics = async (req, res) => {
  try {
    const [
      newLeadsCount,
      qualifiedLeadsCount,
      wonLeadsCount,
      activeProjectsCount,
      delayedProjectsCount,
      totalInvoices,
      totalPayments,
      totalExpenses,
      openTicketsCount,
      expiringDomainsCount,
      clientsCount,
      completedProjectsCount,
      creditNotes
    ] = await Promise.all([
      Lead.countDocuments({ status: 'New', deletedAt: null }),
      Lead.countDocuments({ status: 'Qualified', deletedAt: null }),
      Lead.countDocuments({ status: 'Won', deletedAt: null }),
      Project.countDocuments({ status: 'Active', deletedAt: null }),
      Project.countDocuments({ status: 'Delayed', deletedAt: null }),
      Invoice.find({ deletedAt: null }, 'totalAmount balance status dueDate createdAt'),
      Payment.find({ deletedAt: null, status: { $in: ['Completed', 'Pending'] } }, 'amount paymentDate paymentMethod createdAt status'),
      Expense.find({ deletedAt: null }, 'amount'),
      Ticket.countDocuments({ status: { $ne: 'Closed' }, deletedAt: null }),
      Domain.countDocuments({ status: 'Expiring Soon', deletedAt: null }),
      Client.countDocuments({ deletedAt: null }),
      Project.countDocuments({ status: 'Completed', deletedAt: null }),
      CreditNote.find({ deletedAt: null }, 'totalCreditAmount refundAmount adjustmentType status')
    ]);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalRevenue = totalInvoicedAmount(totalInvoices);
    const totalCollected = totalPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    
    // Payments today & this month
    const collectedToday = totalPayments
      .filter(p => new Date(p.paymentDate || p.createdAt) >= startOfToday)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const collectedThisMonth = totalPayments
      .filter(p => new Date(p.paymentDate || p.createdAt) >= startOfMonth)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    // Total actual cash refunds from credit notes
    const totalRefunds = creditNotes
      .filter(cn => cn.status === 'Applied' && (cn.refundAmount || 0) > 0)
      .reduce((sum, cn) => sum + (cn.refundAmount || 0), 0);

    const netCollected = Math.max(0, totalCollected - totalRefunds);
    const totalCredited = creditNotes.reduce((sum, cn) => sum + (cn.totalCreditAmount || 0), 0);
    const totalOutstanding = totalInvoices.reduce((sum, i) => sum + (i.balance || 0), 0);
    
    const overdueReceivables = totalInvoices
      .filter(i => i.status === 'Overdue' || (i.dueDate && new Date(i.dueDate) < now && (i.balance || 0) > 0))
      .reduce((sum, i) => sum + (i.balance || 0), 0);

    const pendingVerificationCount = await Payment.countDocuments({ 
      verificationStatus: 'Pending Verification', 
      deletedAt: null 
    });

    const totalExpensesCost = totalExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const netProfit = netCollected - totalExpensesCost;

    res.json({
      success: true,
      data: {
        sales: {
          totalClients: clientsCount,
          newLeads: newLeadsCount,
          qualifiedLeads: qualifiedLeadsCount,
          wonLeads: wonLeadsCount
        },
        finance: {
          revenue: totalRevenue,
          collected: totalCollected,
          netCollected,
          collectedToday,
          collectedThisMonth,
          refunds: totalRefunds,
          credited: totalCredited,
          outstanding: totalOutstanding,
          overdue: overdueReceivables,
          pendingVerification: pendingVerificationCount,
          expenses: totalExpensesCost,
          profit: netProfit
        },
        operations: {
          activeProjects: activeProjectsCount,
          delayedProjects: delayedProjectsCount,
          completedProjects: completedProjectsCount,
          openTickets: openTicketsCount
        },
        recurring: {
          expiringDomains: expiringDomainsCount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const totalInvoicedAmount = (invoices) => invoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);

export const getCeoMorningView = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const next7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      overdueInvoices,
      domainList,
      expiringHostings,
      expiringAmcs,
      delayedProjects,
      pendingApprovals,
      urgentTickets,
      dueFollowups
    ] = await Promise.all([
      Invoice.find({ status: 'Overdue', deletedAt: null }).populate('clientId', 'companyName'),
      Domain.find({ expiryDate: { $lte: next30Days }, deletedAt: null }).populate('clientId', 'companyName').sort({ expiryDate: 1 }),
      Hosting.find({ expiryDate: { $lte: next30Days }, deletedAt: null }).populate('clientId', 'companyName'),
      AMC.find({ endDate: { $lte: next30Days }, deletedAt: null }).populate('clientId', 'companyName'),
      Project.find({ status: 'Delayed', deletedAt: null }).populate('clientId', 'companyName'),
      Approval.find({ status: 'Pending' }).populate('requestedBy', 'name email'),
      Ticket.find({ priority: 'Urgent', status: { $ne: 'Closed' }, deletedAt: null }),
      FollowUp.find({ status: 'Pending', followUpDate: { $lte: today }, deletedAt: null }).populate('leadId', 'companyName contactName')
    ]);

    const domainRenewals = {
      expired: [],
      critical: [],
      warning: [],
      totalDue: 0
    };

    domainList.forEach(d => {
      const expiry = new Date(d.expiryDate);
      if (expiry < today) domainRenewals.expired.push(d);
      else if (expiry <= next7Days) domainRenewals.critical.push(d);
      else domainRenewals.warning.push(d);
    });

    domainRenewals.totalDue = domainList.length;

    res.json({
      success: true,
      data: {
        needsAttention: {
          overdueInvoices,
          domainRenewals,
          expiringHostings,
          expiringAmcs,
          delayedProjects,
          pendingApprovals,
          urgentTickets,
          dueFollowups
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getActionCenterItems = async (req, res) => {
  try {
    const today = new Date();

    const [dueFollowups, pendingApprovals, overdueTasks, overdueInvoices] = await Promise.all([
      FollowUp.find({ status: 'Pending', deletedAt: null }).populate('leadId', 'companyName'),
      Approval.find({ status: 'Pending' }),
      Task.find({ status: { $ne: 'Completed' }, dueDate: { $lte: today }, deletedAt: null }).populate('assignedEmployee', 'name'),
      Invoice.find({ balance: { $gt: 0 }, dueDate: { $lte: today }, deletedAt: null }).populate('clientId', 'companyName')
    ]);

    const actionItems = [
      ...dueFollowups.map(f => ({
        id: f._id,
        type: 'Follow-Up Due',
        title: `Follow up with ${f.leadId?.companyName || 'Lead'}`,
        priority: 'High',
        dueDate: f.followUpDate,
        status: f.status
      })),
      ...pendingApprovals.map(a => ({
        id: a._id,
        type: 'Approval Requested',
        title: `${a.module} Approval for ₹${a.amount || 0}`,
        priority: 'Urgent',
        dueDate: a.createdAt,
        status: a.status
      })),
      ...overdueTasks.map(t => ({
        id: t._id,
        type: 'Task Overdue',
        title: `Overdue Task: ${t.taskName} (${t.assignedEmployee?.name || 'Unassigned'})`,
        priority: 'High',
        dueDate: t.dueDate,
        status: t.status
      })),
      ...overdueInvoices.map(i => ({
        id: i._id,
        type: 'Payment Collection',
        title: `Collect ₹${i.balance} for Invoice #${i.invoiceNumber} (${i.clientId?.companyName})`,
        priority: 'Urgent',
        dueDate: i.dueDate,
        status: i.status
      }))
    ];

    res.json({ success: true, data: actionItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
