import CreditNote from '../models/CreditNote.js';
import Invoice from '../models/Invoice.js';
import { generateNextNumber } from '../services/numberingService.js';
import { logAudit } from '../services/auditService.js';

export const getCreditNotes = async (req, res) => {
  try {
    const { clientId, invoiceId, status, page = 1, limit = 50 } = req.query;
    const query = { deletedAt: null };

    if (clientId) query.clientId = clientId;
    if (invoiceId) query.invoiceId = invoiceId;
    if (status && status !== 'All') query.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const data = await CreditNote.find(query)
      .populate('clientId', 'companyName contactPerson email')
      .populate('invoiceId', 'invoiceNumber totalAmount balance amountPaid')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await CreditNote.countDocuments(query);

    res.json({
      success: true,
      data,
      pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCreditNote = async (req, res) => {
  try {
    const data = await CreditNote.findOne({ _id: req.params.id, deletedAt: null })
      .populate('clientId')
      .populate('invoiceId')
      .populate('approvedBy', 'name email');

    if (!data) return res.status(404).json({ success: false, message: 'Credit Note not found' });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCreditNote = async (req, res) => {
  try {
    const { 
      invoiceId, 
      clientId, 
      amount, 
      taxAdjustment = 0, 
      reason, 
      detailedReason, 
      adjustmentType = 'Invoice Balance Reduction',
      refundAmount = 0,
      refundTransactionRef,
      refundPaymentMethod
    } = req.body;

    if (!invoiceId) {
      return res.status(400).json({ success: false, message: 'Original invoiceId is required' });
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Referenced invoice not found' });
    }

    const numAmount = Number(amount) || 0;
    const numTax = Number(taxAdjustment) || 0;
    const totalCredit = numAmount + numTax;

    if (totalCredit <= 0) {
      return res.status(400).json({ success: false, message: 'Credit note amount must be greater than zero' });
    }

    // Safety validation: total credit cannot exceed original invoice total amount
    const existingCredits = await CreditNote.find({ invoiceId, deletedAt: null, status: { $ne: 'Rejected' } });
    const priorCreditedSum = existingCredits.reduce((s, c) => s + (c.totalCreditAmount || 0), 0);

    if (priorCreditedSum + totalCredit > invoice.totalAmount) {
      return res.status(400).json({
        success: false,
        message: `Total credit adjustments (₹${priorCreditedSum + totalCredit}) cannot exceed invoice total amount (₹${invoice.totalAmount})`
      });
    }

    // If adjustment reduces balance, ensure it does not exceed current unpaid balance
    if (adjustmentType === 'Invoice Balance Reduction' && totalCredit > (invoice.balance || 0)) {
      return res.status(400).json({
        success: false,
        message: `Credit note balance reduction (₹${totalCredit}) cannot exceed invoice outstanding balance (₹${invoice.balance})`
      });
    }

    // If cash refund is issued, ensure refund amount cannot exceed amount actually collected/paid
    const numRefund = Number(refundAmount) || 0;
    if (adjustmentType === 'Cash Refund' || numRefund > 0) {
      if (numRefund <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Cash refund requires a valid positive refund amount'
        });
      }
      if (numRefund > (invoice.amountPaid || 0)) {
        return res.status(400).json({
          success: false,
          message: `Cash refund amount (₹${numRefund}) cannot exceed amount actually paid on invoice (₹${invoice.amountPaid || 0})`
        });
      }
    }

    const creditNoteNumber = await generateNextNumber('CREDITNOTE');

    const creditNote = await CreditNote.create({
      creditNoteNumber,
      clientId: clientId || invoice.clientId,
      invoiceId,
      projectId: invoice.projectId,
      amount: numAmount,
      taxAdjustment: numTax,
      totalCreditAmount: totalCredit,
      reason,
      detailedReason,
      adjustmentType,
      refundAmount: Number(refundAmount) || 0,
      refundTransactionRef,
      refundPaymentMethod,
      status: 'Applied',
      approvedBy: req.user?._id,
      createdBy: req.user?._id
    });

    // Recalculate Invoice balance and credited amount
    const allValidCredits = await CreditNote.find({ invoiceId, deletedAt: null, status: 'Applied' });
    const updatedCreditedAmount = allValidCredits.reduce((sum, c) => sum + (c.totalCreditAmount || 0), 0);

    invoice.creditedAmount = updatedCreditedAmount;
    invoice.balance = Math.max(0, invoice.totalAmount - (invoice.amountPaid || 0) - updatedCreditedAmount);
    if (invoice.balance === 0) {
      invoice.status = 'Paid';
    }
    await invoice.save();

    await logAudit({
      userId: req.user?._id,
      action: 'CREATE_CREDIT_NOTE',
      module: 'Invoice',
      recordId: creditNote._id,
      newValues: creditNote.toObject(),
      req
    });

    res.status(201).json({ success: true, data: creditNote, invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
