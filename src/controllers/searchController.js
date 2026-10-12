import Client from '../models/Client.js';
import Lead from '../models/Lead.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Ticket from '../models/Ticket.js';
import Domain from '../models/Domain.js';
import Website from '../models/Website.js';
import Invoice from '../models/Invoice.js';
import Quotation from '../models/Quotation.js';
import Employee from '../models/Employee.js';

export const globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const regex = new RegExp(q.trim(), 'i');

    const [clients, leads, projects, tasks, tickets, domains, websites, invoices, quotations, employees] = await Promise.all([
      Client.find({ $or: [{ companyName: regex }, { clientId: regex }, { email: regex }], deletedAt: null }).limit(5),
      Lead.find({ $or: [{ companyName: regex }, { contactName: regex }, { leadId: regex }], deletedAt: null }).limit(5),
      Project.find({ $or: [{ projectName: regex }, { projectId: regex }], deletedAt: null }).limit(5),
      Task.find({ $or: [{ taskName: regex }, { taskId: regex }], deletedAt: null }).limit(5),
      Ticket.find({ $or: [{ subject: regex }, { ticketId: regex }], deletedAt: null }).limit(5),
      Domain.find({ domainName: regex, deletedAt: null }).limit(5),
      Website.find({ domainName: regex, deletedAt: null }).limit(5),
      Invoice.find({ invoiceNumber: regex, deletedAt: null }).limit(5),
      Quotation.find({ $or: [{ quotationNumber: regex }, { title: regex }], deletedAt: null }).limit(5),
      Employee.find({ $or: [{ name: regex }, { email: regex }, { employeeId: regex }], deletedAt: null }).limit(5)
    ]);

    const results = [
      ...clients.map(c => ({ type: 'Client', id: c._id, title: c.companyName, subtitle: c.clientId, link: `/clients/${c._id}` })),
      ...leads.map(l => ({ type: 'Lead', id: l._id, title: l.companyName, subtitle: l.contactName, link: `/crm/leads` })),
      ...projects.map(p => ({ type: 'Project', id: p._id, title: p.projectName, subtitle: p.projectId, link: `/projects/${p._id}` })),
      ...tasks.map(t => ({ type: 'Task', id: t._id, title: t.taskName, subtitle: t.status, link: `/tasks` })),
      ...tickets.map(tk => ({ type: 'Ticket', id: tk._id, title: tk.subject, subtitle: tk.ticketId, link: `/support/tickets` })),
      ...domains.map(d => ({ type: 'Domain', id: d._id, title: d.domainName, subtitle: d.status, link: `/domains` })),
      ...websites.map(w => ({ type: 'Website', id: w._id, title: w.domainName, subtitle: w.websiteType, link: `/digital-assets/websites` })),
      ...invoices.map(i => ({ type: 'Invoice', id: i._id, title: `Invoice #${i.invoiceNumber}`, subtitle: `Balance: ₹${i.balance}`, link: `/finance/invoices` })),
      ...quotations.map(q => ({ type: 'Quotation', id: q._id, title: q.title || `Quotation #${q.quotationNumber}`, subtitle: `₹${q.totalAmount || 0} (${q.approvalStatus || 'Draft'})`, link: `/sales/quotations` })),
      ...employees.map(e => ({ type: 'Employee', id: e._id, title: e.name, subtitle: e.department || e.email, link: `/hr/employees` }))
    ];

    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
