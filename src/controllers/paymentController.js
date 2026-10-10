import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import { generateNextNumber } from '../services/numberingService.js';
import { logAudit } from '../services/auditService.js';
import { triggerWorkflow } from '../services/workflowService.js';

export const getPayments = async (req, res) => {
  try {
    const { clientId, invoiceId, page = 1, limit = 50 } = req.query;
    const query = { deletedAt: null };

    if (clientId) query.clientId = clientId;
    if (invoiceId) query.invoiceId = invoiceId;

    const skip = (Number(page) - 1) * Number(limit);
    const data = await Payment.find(query)
      .populate('clientId', 'companyName contactPerson email')
      .populate('invoiceId', 'invoiceNumber totalAmount balance')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPayment = async (req, res) => {
  try {
    const data = await Payment.findById(req.params.id)
      .populate('clientId')
      .populate('invoiceId');
    if (!data) return res.status(404).json({ success: false, message: 'Payment record not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPayment = async (req, res) => {
  try {
    const { clientId, invoiceId, amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
    }

    const paymentId = await generateNextNumber('PAYMENT');
    const payment = await Payment.create({
      ...req.body,
      paymentId,
      createdBy: req.user?._id
    });

    // Automatically update connected Invoice balance & status
    if (invoiceId) {
      const invoice = await Invoice.findById(invoiceId);
      if (invoice) {
        invoice.amountPaid = (invoice.amountPaid || 0) + Number(amount);
        invoice.balance = Math.max(0, invoice.totalAmount - invoice.amountPaid);

        if (invoice.balance <= 0) {
          invoice.status = 'Paid';
        } else {
          invoice.status = 'Partially Paid';
        }
        await invoice.save();
      }
    }

    await logAudit({
      userId: req.user?._id,
      action: 'RECORD_PAYMENT',
      module: 'Payment',
      recordId: payment._id,
      newValues: payment.toObject(),
      req
    });

    await triggerWorkflow('PAYMENT_RECEIVED', { userId: req.user?._id, paymentId: payment._id, amount });

    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePayment = async (req, res) => {
  try {
    const old = await Payment.findById(req.params.id);
    if (!old) return res.status(404).json({ success: false, message: 'Payment record not found' });

    const data = await Payment.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedBy: req.user?._id },
      { new: true, runValidators: true }
    );

    await logAudit({
      userId: req.user?._id,
      action: 'UPDATE_PAYMENT',
      module: 'Payment',
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

export const deletePayment = async (req, res) => {
  try {
    const data = await Payment.findByIdAndUpdate(req.params.id, { deletedAt: new Date() }, { new: true });
    res.json({ success: true, message: 'Payment record deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
