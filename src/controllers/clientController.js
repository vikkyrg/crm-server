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
    const data = await Client.find(query)
      .populate('accountManager', 'name email')
      .populate('salesperson', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Client.countDocuments(query);

    res.json({
      success: true,
      data,
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
      audits
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
      AuditLog.find({ recordId: clientId }).sort({ createdAt: -1 }).limit(20)
    ]);

    // Financial totals summary
    const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
    const totalPaid = payments.reduce((sum, pay) => sum + (pay.amount || 0), 0);
    const totalOutstanding = totalInvoiced - totalPaid;

    res.json({
      success: true,
      data: {
        client,
        summary: {
          totalProjects: projects.length,
          totalInvoiced,
          totalPaid,
          totalOutstanding,
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
    const data = await Client.findByIdAndUpdate(
      req.params.id,
      { deletedAt: new Date(), updatedBy: req.user?._id },
      { new: true }
    );
    if (!data) return res.status(404).json({ success: false, message: 'Client not found' });

    await logAudit({
      userId: req.user?._id,
      action: 'DELETE_CLIENT',
      module: 'Client',
      recordId: data._id,
      req
    });

    res.json({ success: true, message: 'Client deleted/archived successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
