import Quotation from '../models/Quotation.js';
import Approval from '../models/Approval.js';
import { generateNextNumber } from '../services/numberingService.js';
import { logAudit } from '../services/auditService.js';

export const getQuotations = async (req, res) => {
  try {
    const { search, status, clientId, page = 1, limit = 50 } = req.query;
    const query = { deletedAt: null };

    if (status) query.status = status;
    if (clientId) query.clientId = clientId;
    if (search) {
      query.$or = [
        { quotationNumber: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const data = await Quotation.find(query)
      .populate('clientId', 'companyName contactPerson email')
      .populate('salesperson', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Quotation.countDocuments(query);

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuotation = async (req, res) => {
  try {
    const data = await Quotation.findById(req.params.id)
      .populate('clientId')
      .populate('salesperson', 'name email');
    if (!data) return res.status(404).json({ success: false, message: 'Quotation not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const calculateQuotationTotals = (items = []) => {
  let subtotal = 0;
  let discountTotal = 0;
  let taxTotal = 0;

  const calculatedItems = items.map(item => {
    const qty = Number(item.quantity) || 1;
    const rate = Number(item.rate) || 0;
    const disc = Number(item.discount) || 0;
    const taxPct = Number(item.taxPercent) || 18;

    const baseAmount = qty * rate;
    const afterDiscount = Math.max(0, baseAmount - disc);
    const taxVal = (afterDiscount * taxPct) / 100;
    const itemTotal = afterDiscount + taxVal;

    subtotal += baseAmount;
    discountTotal += disc;
    taxTotal += taxVal;

    return { ...item, amount: itemTotal };
  });

  const totalAmount = subtotal - discountTotal + taxTotal;
  return { items: calculatedItems, subtotal, discountTotal, taxTotal, totalAmount };
};

export const createQuotation = async (req, res) => {
  try {
    const quotationNumber = await generateNextNumber('QUOTATION');
    const { items, subtotal, discountTotal, taxTotal, totalAmount } = calculateQuotationTotals(req.body.items);

    const data = await Quotation.create({
      ...req.body,
      quotationNumber,
      items,
      subtotal,
      discountTotal,
      taxTotal,
      totalAmount,
      createdBy: req.user?._id
    });

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_QUOTATION',
      module: 'Quotation',
      recordId: data._id,
      newValues: data.toObject(),
      req
    });

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitForApproval = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ success: false, message: 'Quotation not found' });

    quotation.approvalStatus = 'Pending Approval';
    quotation.status = 'Pending Approval';
    await quotation.save();

    const approval = await Approval.create({
      module: 'Quotation',
      recordId: quotation._id,
      requestedBy: req.user?._id,
      amount: quotation.totalAmount,
      status: 'Pending',
      createdBy: req.user?._id
    });

    res.json({
      success: true,
      message: 'Quotation submitted for management approval',
      data: { quotation, approval }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateQuotation = async (req, res) => {
  try {
    const old = await Quotation.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: 'Quotation not found' });

    let updateData = { ...req.body, updatedBy: req.user?._id };
    if (req.body.items) {
      const totals = calculateQuotationTotals(req.body.items);
      updateData = { ...updateData, ...totals };
    }

    const data = await Quotation.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

    await logAudit({
      userId: req.user?._id,
      action: 'UPDATE_QUOTATION',
      module: 'Quotation',
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

export const deleteQuotation = async (req, res) => {
  try {
    const data = await Quotation.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true });
    res.json({ success: true, message: 'Quotation deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
