import Invoice from '../models/Invoice.js';
import { generateNextNumber } from '../services/numberingService.js';
import { logAudit } from '../services/auditService.js';

export const getInvoices = async (req, res) => {
  try {
    const { search, status, clientId, page = 1, limit = 50 } = req.query;
    const query = { deletedAt: null };

    if (status) query.status = status;
    if (clientId) query.clientId = clientId;

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const data = await Invoice.find(query)
      .populate('clientId', 'companyName contactPerson email')
      .populate('projectId', 'projectName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Invoice.countDocuments(query);

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInvoice = async (req, res) => {
  try {
    const data = await Invoice.findById(req.params.id)
      .populate('clientId')
      .populate('projectId');
    if (!data) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInvoice = async (req, res) => {
  try {
    const invoiceNumber = await generateNextNumber('INVOICE');
    const { totalAmount, amountPaid = 0 } = req.body;
    const balance = Math.max(0, totalAmount - amountPaid);
    
    let status = 'Draft';
    if (amountPaid >= totalAmount && totalAmount > 0) status = 'Paid';
    else if (amountPaid > 0) status = 'Partially Paid';

    const data = await Invoice.create({
      ...req.body,
      invoiceNumber,
      balance,
      status,
      createdBy: req.user?._id
    });

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_INVOICE',
      module: 'Invoice',
      recordId: data._id,
      newValues: data.toObject(),
      req
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInvoice = async (req, res) => {
  try {
    const old = await Invoice.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: 'Invoice not found' });

    const totalAmount = req.body.totalAmount !== undefined ? req.body.totalAmount : old.totalAmount;
    const amountPaid = req.body.amountPaid !== undefined ? req.body.amountPaid : old.amountPaid;
    const balance = Math.max(0, totalAmount - amountPaid);

    let status = req.body.status || old.status;
    if (amountPaid >= totalAmount && totalAmount > 0) status = 'Paid';
    else if (amountPaid > 0 && status !== 'Cancelled') status = 'Partially Paid';

    const data = await Invoice.findByIdAndUpdate(
      req.params.id,
      { ...req.body, balance, status, updatedBy: req.user?._id },
      { new: true, runValidators: true }
    );

    await logAudit({
      userId: req.user?._id,
      action: 'UPDATE_INVOICE',
      module: 'Invoice',
      recordId: data._id,
      oldValues: old.toObject(),
      newValues: data.toObject(),
      req
    });

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteInvoice = async (req, res) => {
  try {
    const data = await Invoice.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true });
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
