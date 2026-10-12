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
    let { items, subtotal, discountAmount = 0, taxAmount = 0, totalAmount, amountPaid = 0 } = req.body;

    if (items && Array.isArray(items) && items.length > 0) {
      items = items.map(it => ({
        item: it.item || 'Service',
        description: it.description || '',
        quantity: Number(it.quantity) || 1,
        rate: Number(it.rate) || 0,
        amount: (Number(it.quantity) || 1) * (Number(it.rate) || 0)
      }));
      subtotal = items.reduce((s, it) => s + it.amount, 0);
      discountAmount = Number(discountAmount) || 0;
      taxAmount = Number(taxAmount) || 0;
      totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);
    } else {
      totalAmount = Number(totalAmount) || 0;
      subtotal = Number(subtotal) || totalAmount;
    }

    const balance = Math.max(0, totalAmount - amountPaid);
    
    let status = req.body.status || 'Draft';
    if (amountPaid >= totalAmount && totalAmount > 0) status = 'Paid';
    else if (amountPaid > 0) status = 'Partially Paid';
    else if (!req.body.status) status = 'Sent';

    const data = await Invoice.create({
      ...req.body,
      invoiceNumber,
      items,
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
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

    let updatePayload = { ...req.body };
    if (req.body.items && Array.isArray(req.body.items)) {
      const items = req.body.items.map(it => ({
        item: it.item || 'Service',
        description: it.description || '',
        quantity: Number(it.quantity) || 1,
        rate: Number(it.rate) || 0,
        amount: (Number(it.quantity) || 1) * (Number(it.rate) || 0)
      }));
      const subtotal = items.reduce((s, it) => s + it.amount, 0);
      const discountAmount = Number(req.body.discountAmount !== undefined ? req.body.discountAmount : old.discountAmount) || 0;
      const taxAmount = Number(req.body.taxAmount !== undefined ? req.body.taxAmount : old.taxAmount) || 0;
      const totalAmount = Math.max(0, subtotal - discountAmount + taxAmount);

      updatePayload = {
        ...updatePayload,
        items,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount
      };
    }

    const totalAmount = updatePayload.totalAmount !== undefined ? updatePayload.totalAmount : old.totalAmount;
    const amountPaid = updatePayload.amountPaid !== undefined ? updatePayload.amountPaid : old.amountPaid;
    const balance = Math.max(0, totalAmount - amountPaid);

    let status = updatePayload.status || old.status;
    if (amountPaid >= totalAmount && totalAmount > 0) status = 'Paid';
    else if (amountPaid > 0 && status !== 'Cancelled') status = 'Partially Paid';

    const data = await Invoice.findByIdAndUpdate(
      req.params.id,
      { ...updatePayload, balance, status, updatedBy: req.user?._id },
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
