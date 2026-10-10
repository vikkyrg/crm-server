import Ticket from '../models/Ticket.js';
import Domain from '../models/Domain.js';
import Hosting from '../models/Hosting.js';
import Invoice from '../models/Invoice.js';
import Notification from '../models/Notification.js';

export const runEscalationAndReminders = async () => {
  try {
    const today = new Date();
    console.log('⏰ Running SLA Escalation & Renewal Check Job...');

    // 1. Mark Overdue Invoices
    const overdueInvoices = await Invoice.updateMany(
      { balance: { $gt: 0 }, dueDate: { $lt: today }, status: { $ne: 'Overdue' }, deletedAt: null },
      { status: 'Overdue' }
    );
    if (overdueInvoices.modifiedCount > 0) {
      console.log(`[Job] Updated ${overdueInvoices.modifiedCount} invoices to Overdue`);
    }

    // 2. Mark Expiring Domains (<= 30 days)
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringDomains = await Domain.updateMany(
      { expiryDate: { $lte: next30Days }, status: 'Active', deletedAt: null },
      { status: 'Expiring Soon' }
    );
    if (expiringDomains.modifiedCount > 0) {
      console.log(`[Job] Updated ${expiringDomains.modifiedCount} domains to Expiring Soon`);
    }

    // 3. Mark Expiring Hostings
    const expiringHostings = await Hosting.updateMany(
      { expiryDate: { $lte: next30Days }, status: 'Active', deletedAt: null },
      { status: 'Expiring Soon' }
    );
    if (expiringHostings.modifiedCount > 0) {
      console.log(`[Job] Updated ${expiringHostings.modifiedCount} hostings to Expiring Soon`);
    }

    return { success: true };
  } catch (err) {
    console.error('Job Execution Error:', err.message);
  }
};
