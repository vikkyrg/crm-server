import Client from '../models/Client.js';
import Contact from '../models/Contact.js';
import Lead from '../models/Lead.js';
import Quotation from '../models/Quotation.js';
import Contract from '../models/Contract.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Website from '../models/Website.js';
import MobileApp from '../models/MobileApp.js';
import Domain from '../models/Domain.js';
import Hosting from '../models/Hosting.js';
import AMC from '../models/AMC.js';
import Ticket from '../models/Ticket.js';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import Expense from '../models/Expense.js';
import Document from '../models/Document.js';
import AuditLog from '../models/AuditLog.js';
import CreditNote from '../models/CreditNote.js';
import FollowUp from '../models/FollowUp.js';
import { generateNextNumber } from '../services/numberingService.js';
import { logAudit } from '../services/auditService.js';

export const getClients = async (req, res) => {
  try {
    const { search, status, clientType, page = 1, limit = 50 } = req.query;
    const query = { deletedAt: null };

    if (status) query.status = status;
    if (clientType) query.clientType = clientType;

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { contactPerson: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { gstNumber: { $regex: search, $options: 'i' } },
        { clientId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const clients = await Client.find(query)
      .populate('accountManager', 'name email')
      .populate('salesperson', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Client.countDocuments(query);

    // Enrich clients with lightweight aggregated metrics
    const clientIds = clients.map(c => c._id);
    const [allProjects, allInvoices, allPayments] = await Promise.all([
      Project.find({ clientId: { $in: clientIds }, deletedAt: null }, 'clientId budget serviceType assignedServices'),
      Invoice.find({ clientId: { $in: clientIds }, deletedAt: null }, 'clientId totalAmount balance'),
      Payment.find({ clientId: { $in: clientIds }, deletedAt: null }, 'clientId amount')
    ]);

    const enrichedClients = clients.map(c => {
      const cIdStr = String(c._id);
      const cProjects = allProjects.filter(p => String(p.clientId) === cIdStr);
      const cInvoices = allInvoices.filter(i => String(i.clientId) === cIdStr);
      const cPayments = allPayments.filter(p => String(p.clientId) === cIdStr);

      const totalContractValue = cProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
      const totalInvoiced = cInvoices.reduce((sum, i) => sum + (i.totalAmount || 0), 0);
      const totalPaid = cPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const totalOutstanding = Math.max(0, cInvoices.reduce((sum, i) => sum + (i.balance || 0), 0));

      const servicesSet = new Set();
      cProjects.forEach(p => {
        if (p.serviceType) servicesSet.add(p.serviceType);
        if (p.assignedServices && Array.isArray(p.assignedServices)) {
          p.assignedServices.forEach(s => s.serviceName && servicesSet.add(s.serviceName));
        }
      });

      return {
        ...c.toObject(),
        projectsCount: cProjects.length,
        servicesList: Array.from(servicesSet),
        totalContractValue,
        totalInvoiced,
        totalPaid,
        totalOutstanding
      };
    });

    res.json({
      success: true,
      data: enrichedClients,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getClient = async (req, res) => {
  try {
    const data = await Client.findById(req.params.id)
      .populate('accountManager', 'name email')
      .populate('salesperson', 'name email');
    if (!data) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CLIENT 360 DEGREE VIEW AGGREGATION API
export const getClient360 = async (req, res) => {
  try {
    const clientId = req.params.id;
    const client = await Client.findById(clientId)
      .populate('accountManager', 'name email')
      .populate('salesperson', 'name email');

    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    // Fetch all related connected entity records in parallel
    const [
      contacts,
      leads,
      quotations,
      contracts,
      projects,
      websites,
      mobileApps,
      domains,
      hostings,
      amcs,
      tickets,
      invoices,
      payments,
      expenses,
      documents,
      audits,
      creditNotes
    ] = await Promise.all([
      Contact.find({ clientId, deletedAt: null }),
      Lead.find({ convertedClientId: clientId, deletedAt: null }),
      Quotation.find({ clientId, deletedAt: null }),
      Contract.find({ clientId, deletedAt: null }),
      Project.find({ clientId, deletedAt: null }),
      Website.find({ clientId, deletedAt: null }),
      MobileApp.find({ clientId, deletedAt: null }),
      Domain.find({ clientId, deletedAt: null }),
      Hosting.find({ clientId, deletedAt: null }),
      AMC.find({ clientId, deletedAt: null }),
      Ticket.find({ clientId, deletedAt: null }),
      Invoice.find({ clientId, deletedAt: null }),
      Payment.find({ clientId, deletedAt: null }),
      Expense.find({ clientId, deletedAt: null }),
      Document.find({ relatedRecordId: clientId, deletedAt: null }),
      AuditLog.find({ recordId: clientId }).sort({ createdAt: -1 }).limit(20),
      CreditNote.find({ clientId, deletedAt: null })
    ]);

    // Financial totals summary with decimal safety
    const totalContractValue = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const totalCredited = creditNotes.reduce((sum, cn) => sum + (cn.totalCreditAmount || 0), 0);
    const totalOutstanding = Math.max(0, invoices.reduce((sum, inv) => sum + (inv.balance || 0), 0));
    const now = new Date();
    const totalOverdue = invoices
      .filter(inv => inv.status === 'Overdue' || (inv.dueDate && new Date(inv.dueDate) < now && (inv.balance || 0) > 0))
      .reduce((sum, inv) => sum + (inv.balance || 0), 0);

    // Advance received: Payments linked to advance invoices, or unallocated direct advance payments
    const advanceInvoices = invoices.filter(inv => inv.invoiceType === 'Advance');
    const advanceInvoiceIds = new Set(advanceInvoices.map(i => String(i._id)));
    const totalAdvanceReceived = payments
      .filter(p => (p.invoiceId && advanceInvoiceIds.has(String(p.invoiceId))) || (!p.invoiceId && (p.paymentType === 'Advance' || p.paymentType === 'Retainer')))
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const unallocatedAdvance = payments
      .filter(p => !p.invoiceId && ['Completed', 'Pending'].includes(p.status))
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const totalUnbilled = Math.max(0, totalContractValue - totalInvoiced);

    // Project breakdown
    const activeProjects = projects.filter(p => ['Active', 'In Progress'].includes(p.status)).length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const delayedProjects = projects.filter(p => p.status === 'Delayed').length;
    const pendingProjects = projects.filter(p => ['Planning', 'On Hold', 'Testing'].includes(p.status)).length;

    res.json({
      success: true,
      data: {
        client,
        summary: {
          totalProjects: projects.length,
          activeProjects,
          completedProjects,
          delayedProjects,
          pendingProjects,
          totalContractValue,
          totalInvoiced,
          totalPaid,
          totalAdvanceReceived,
          unallocatedAdvance,
          totalCredited,
          totalOutstanding,
          totalOverdue,
          totalUnbilled,
          activeTickets: tickets.filter(t => t.status !== 'Closed').length,
          activeAmcs: amcs.filter(a => a.renewalStatus === 'Active').length
        },
        contacts,
        leads,
        quotations,
        contracts,
        projects,
        websites,
        mobileApps,
        domains,
        hostings,
        amcs,
        tickets,
        invoices,
        payments,
        expenses,
        documents,
        creditNotes,
        activityTimeline: audits
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createClient = async (req, res) => {
  try {
    const { companyName, email, phone, gstNumber } = req.body;

    // Duplicate detection
    const duplicate = await Client.findOne({
      deletedAt: null,
      $or: [
        { companyName: companyName.trim() },
        ...(email ? [{ email }] : []),
        ...(phone ? [{ phone }] : []),
        ...(gstNumber ? [{ gstNumber }] : [])
      ]
    });

    if (duplicate) {
      return res.status(409).json({
        success: false,
        message: `Duplicate client detected with matching Company/Email/Phone/GST (Existing Client ID: ${duplicate.clientId})`
      });
    }

    const clientId = await generateNextNumber('CLIENT');
    const data = await Client.create({
      ...req.body,
      clientId,
      createdBy: req.user?._id
    });

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_CLIENT',
      module: 'Client',
      recordId: data._id,
      newValues: data.toObject(),
      req
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateClient = async (req, res) => {
  try {
    const oldClient = await Client.findById(req.params.id);
    if (!oldClient) return res.status(404).json({ success: false, message: 'Client not found' });

    const data = await Client.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?._id },
      { new: true, runValidators: true }
    );

    await logAudit({
      userId: req.user?._id,
      action: 'UPDATE_CLIENT',
      module: 'Client',
      recordId: data._id,
      oldValues: oldClient.toObject(),
      newValues: data.toObject(),
      req
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteClient = async (req, res) => {
  try {
    const clientId = req.params.id;
    const { permanent } = req.query; // supports ?permanent=true for hard delete if requested

    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ success: false, message: 'Client not found' });

    // Find all projects belonging to this client to also delete their linked tasks
    const clientProjects = await Project.find({ clientId }).select('_id');
    const projectIds = clientProjects.map(p => p._id);

    if (permanent === 'true') {
      // 1. Hard cascade delete across all connected collections
      await Promise.all([
        Client.findByIdAndDelete(clientId),
        Contact.deleteMany({ clientId }),
        Lead.updateMany({ convertedClientId: clientId }, { $unset: { convertedClientId: 1, isConverted: 1 } }),
        FollowUp.deleteMany({ clientId }),
        Quotation.deleteMany({ clientId }),
        Contract.deleteMany({ clientId }),
        Project.deleteMany({ clientId }),
        Task.deleteMany({ projectId: { $in: projectIds } }),
        Website.deleteMany({ clientId }),
        MobileApp.deleteMany({ clientId }),
        Domain.deleteMany({ clientId }),
        Hosting.deleteMany({ clientId }),
        AMC.deleteMany({ clientId }),
        Ticket.deleteMany({ clientId }),
        Invoice.deleteMany({ clientId }),
        Payment.deleteMany({ clientId }),
        Expense.deleteMany({ clientId }),
        Document.deleteMany({ $or: [{ relatedRecordId: clientId }, { relatedRecordId: { $in: projectIds } }] }),
        CreditNote.deleteMany({ clientId })
      ]);

      await logAudit({
        userId: req.user?._id,
        action: 'PERMANENT_DELETE_CLIENT',
        module: 'Client',
        recordId: client._id,
        oldValues: { companyName: client.companyName },
        req
      });

      return res.json({ 
        success: true, 
        message: `Client "${client.companyName}" and all associated data permanently removed across all modules.` 
      });
    }

    // 2. Comprehensive Cascade Soft Delete (default safe enterprise behavior)
    const now = new Date();
    const userId = req.user?._id;

    await Promise.all([
      Client.findByIdAndUpdate(clientId, { deletedAt: now, status: 'Inactive', updatedBy: userId }),
      Contact.updateMany({ clientId, deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      FollowUp.updateMany({ clientId, deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      Quotation.updateMany({ clientId, deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      Contract.updateMany({ clientId, deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      Project.updateMany({ clientId, deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      Task.updateMany({ projectId: { $in: projectIds }, deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      Website.updateMany({ clientId, deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      MobileApp.updateMany({ clientId, deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      Domain.updateMany({ clientId, deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      Hosting.updateMany({ clientId, deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      AMC.updateMany({ clientId, deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      Ticket.updateMany({ clientId, deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      Invoice.updateMany({ clientId, deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      Payment.updateMany({ clientId, deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      Expense.updateMany({ clientId, deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      Document.updateMany({ $or: [{ relatedRecordId: clientId }, { relatedRecordId: { $in: projectIds } }], deletedAt: null }, { deletedAt: now, updatedBy: userId }),
      CreditNote.updateMany({ clientId, deletedAt: null }, { deletedAt: now, updatedBy: userId })
    ]);

    await logAudit({
      userId: req.user?._id,
      action: 'CASCADE_DELETE_CLIENT',
      module: 'Client',
      recordId: client._id,
      oldValues: { companyName: client.companyName },
      req
    });

    res.json({ 
      success: true, 
      message: `Client "${client.companyName}" and all linked records removed from all pages.` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
