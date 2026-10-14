import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import Company from '../models/Company.js';
import { generateNextNumber } from '../services/numberingService.js';
import { logAudit } from '../services/auditService.js';
import { triggerWorkflow } from '../services/workflowService.js';

/**
 * Recomputes invoice amountPaid, creditedAmount, balance, and status accurately
 */
export const recalculateInvoice = async (invoiceId) => {
  if (!invoiceId) return null;
  const invoice = await Invoice.findById(invoiceId);
  if (!invoice || invoice.deletedAt) return null;

  // Active completed payments
  const payments = await Payment.find({ 
    invoiceId, 
    deletedAt: null, 
    status: { $in: ['Completed', 'Pending'] } 
  });
  const totalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalCredited = Number(invoice.creditedAmount) || 0;
  const totalAmount = Number(invoice.totalAmount) || 0;
  const newBalance = Math.max(0, Number((totalAmount - totalPaid - totalCredited).toFixed(2)));

  invoice.amountPaid = Number(totalPaid.toFixed(2));
  invoice.balance = newBalance;

  if (newBalance <= 0 && totalAmount > 0) {
    invoice.status = 'Paid';
  } else if (invoice.amountPaid > 0) {
    invoice.status = 'Partially Paid';
  } else if (invoice.dueDate && new Date(invoice.dueDate) < new Date() && invoice.status !== 'Draft') {
    invoice.status = 'Overdue';
  } else if (invoice.status !== 'Draft' && invoice.status !== 'Cancelled') {
    invoice.status = 'Sent';
  }

  await invoice.save();
  return invoice;
};

/**
 * GET /api/v1/payments
 * Filter by client, invoice, paymentMethod, status, date range, search
 */
export const getPayments = async (req, res) => {
  try {
    const { 
      clientId, 
      invoiceId, 
      paymentMethod, 
      status, 
      startDate, 
      endDate, 
      search, 
      page = 1, 
      limit = 50 
    } = req.query;

    const query = { deletedAt: null };

    // Role-based / client portal isolation
    if (req.user && req.user.role === 'Client' && req.user.clientId) {
      query.clientId = req.user.clientId;
    } else if (clientId) {
      query.clientId = clientId;
    }

    if (invoiceId && typeof invoiceId === 'string' && invoiceId.trim() !== '') {
      if (mongoose.Types.ObjectId.isValid(invoiceId.trim())) {
        query.invoiceId = invoiceId.trim();
      }
    }
    if (paymentMethod && paymentMethod !== 'All') query.paymentMethod = paymentMethod;
    if (status && status !== 'All') query.status = status;

    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.paymentDate.$lte = end;
      }
    }

    if (search && search.trim()) {
      const s = search.trim();
      query.$or = [
        { paymentId: { $regex: s, $options: 'i' } },
        { receiptNumber: { $regex: s, $options: 'i' } },
        { transactionReference: { $regex: s, $options: 'i' } },
        { notes: { $regex: s, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const data = await Payment.find(query)
      .populate('clientId', 'companyName name contactPerson email phone')
      .populate('invoiceId', 'invoiceNumber totalAmount balance status invoiceDate dueDate')
      .populate('projectId', 'projectName projectId')
      .populate('createdBy', 'name email')
      .sort({ paymentDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data,
      pagination: { 
        total, 
        page: Number(page), 
        limit: Number(limit), 
        pages: Math.ceil(total / Number(limit)) 
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/payments/:id
 */
export const getPayment = async (req, res) => {
  try {
    const data = await Payment.findOne({ _id: req.params.id, deletedAt: null })
      .populate('clientId')
      .populate('invoiceId')
      .populate('projectId')
      .populate('createdBy', 'name email')
      .populate('verifiedBy', 'name email');

    if (!data) return res.status(404).json({ success: false, message: 'Payment record not found' });

    // Client portal security check
    if (req.user && req.user.role === 'Client' && String(data.clientId?._id || data.clientId) !== String(req.user.clientId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have access to this payment' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/v1/payments/:id/receipt
 * Returns printable/downloadable receipt data package with company details
 */
export const getPaymentReceipt = async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, deletedAt: null })
      .populate('clientId')
      .populate('invoiceId')
      .populate('projectId')
      .populate('createdBy', 'name email');

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    // Client isolation check
    if (req.user && req.user.role === 'Client' && String(payment.clientId?._id || payment.clientId) !== String(req.user.clientId)) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have access to this receipt' });
    }

    const company = await Company.findOne({ status: 'Active' }) || {
      name: 'Innomatrics Technologies Pvt Ltd',
      legalName: 'Innomatrics Technologies Private Limited',
      gstNumber: '07AAAAA0000A1Z5',
      panNumber: 'AAAAA0000A',
      email: 'finance@innomatrics.com',
      phone: '+91 98765 43210',
      address: 'Suite 404, Cyber City, Tech Zone',
      city: 'Gurugram',
      state: 'Haryana',
      country: 'India',
      currency: 'INR'
    };

    res.json({
      success: true,
      data: {
        payment,
        company
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/v1/payments
 * Record a new payment with strict financial validation and concurrency protection
 */
export const createPayment = async (req, res) => {
  try {
    const { 
      clientId, 
      invoiceId, 
      amount, 
      paymentDate, 
      paymentMethod = 'Bank Transfer',
      transactionReference, 
      bankName,
      gatewayName,
      notes,
      status = 'Completed'
    } = req.body;

    if (!clientId) {
      return res.status(400).json({ success: false, message: 'Client selection is required' });
    }

    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Payment amount must be greater than zero' });
    }

    // Client organization validation
    const client = await Client.findById(clientId);
    if (!client || client.deletedAt) {
      return res.status(404).json({ success: false, message: 'Selected client not found' });
    }

    // Prevent duplicate transaction reference
    if (transactionReference && String(transactionReference).trim()) {
      const cleanRef = String(transactionReference).trim();
      const existingRef = await Payment.findOne({
        transactionReference: cleanRef,
        deletedAt: null
      });
      if (existingRef) {
        return res.status(409).json({
          success: false,
          message: `A payment with transaction reference "${cleanRef}" has already been recorded.`
        });
      }
    }

    // Normalize empty strings or whitespace values to null
    const cleanInvoiceId = (invoiceId && typeof invoiceId === 'string' && invoiceId.trim() !== '') ? invoiceId.trim() : null;
    let cleanProjectId = (req.body.projectId && typeof req.body.projectId === 'string' && req.body.projectId.trim() !== '') ? req.body.projectId.trim() : null;

    let invoice = null;

    if (cleanInvoiceId) {
      if (!mongoose.Types.ObjectId.isValid(cleanInvoiceId)) {
        return res.status(400).json({ success: false, message: 'Invalid invoice ID format' });
      }

      invoice = await Invoice.findById(cleanInvoiceId);
      if (!invoice || invoice.deletedAt) {
        return res.status(404).json({ success: false, message: 'Referenced invoice not found' });
      }

      // Verify invoice belongs to the chosen client
      if (String(invoice.clientId) !== String(clientId)) {
        return res.status(400).json({ 
          success: false, 
          message: 'The selected invoice does not belong to the selected client' 
        });
      }

      // Disallow payment on cancelled or zero balance invoices
      if (invoice.status === 'Cancelled') {
        return res.status(400).json({ success: false, message: 'Cannot apply payment to a cancelled invoice' });
      }
      if ((invoice.balance || 0) <= 0) {
        return res.status(400).json({ success: false, message: 'This invoice is already fully paid and settled' });
      }

      // Check balance limit
      if (numAmount > invoice.balance) {
        return res.status(400).json({
          success: false,
          message: `Payment amount (₹${numAmount.toLocaleString()}) cannot exceed the invoice's outstanding balance (₹${invoice.balance.toLocaleString()})`
        });
      }

      // Link project if invoice has one
      if (invoice.projectId && !cleanProjectId) {
        cleanProjectId = invoice.projectId;
      }

      // Atomic conditional reservation: ensures two concurrent payments do not exceed balance
      const updatedInv = await Invoice.findOneAndUpdate(
        { _id: cleanInvoiceId, balance: { $gte: numAmount }, deletedAt: null },
        { $inc: { amountPaid: numAmount, balance: -numAmount } },
        { returnDocument: 'after' }
      );

      if (!updatedInv) {
        const recheck = await Invoice.findById(cleanInvoiceId);
        return res.status(409).json({
          success: false,
          message: `Payment could not be processed because the invoice balance changed concurrently (Available: ₹${recheck?.balance || 0})`
        });
      }
    }

    const determinedPaymentType = cleanInvoiceId ? 'Invoice Payment' : (req.body.paymentType || 'Advance');

    let payment;
    try {
      const paymentId = await generateNextNumber('PAYMENT');
      const receiptNumber = await generateNextNumber('RECEIPT');

      payment = await Payment.create({
        companyId: client.companyId,
        paymentId,
        receiptNumber,
        clientId,
        invoiceId: cleanInvoiceId,
        projectId: cleanProjectId,
        paymentType: determinedPaymentType,
        amount: Number(numAmount.toFixed(2)),
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMethod,
        transactionReference: transactionReference ? String(transactionReference).trim() : undefined,
        bankName,
        gatewayName,
        notes,
        status,
        verificationStatus: 'Verified',
        verifiedBy: req.user?._id,
        verifiedAt: new Date(),
        createdBy: req.user?._id
      });
    } catch (createErr) {
      // Rollback atomic invoice deduction if payment creation fails
      if (cleanInvoiceId) {
        await Invoice.findByIdAndUpdate(cleanInvoiceId, {
          $inc: { amountPaid: -numAmount, balance: numAmount }
        });
      }
      if (createErr.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'A duplicate transaction reference or identifier was detected concurrently'
        });
      }
      throw createErr;
    }

    // Reconcile invoice state only if an invoice is linked
    if (cleanInvoiceId) {
      await recalculateInvoice(cleanInvoiceId);
    }

    await logAudit({
      userId: req.user?._id,
      action: 'RECORD_PAYMENT',
      module: 'Payment',
      recordId: payment._id,
      newValues: payment.toObject(),
      req
    });

    await triggerWorkflow('PAYMENT_RECEIVED', {
      userId: req.user?._id,
      paymentId: payment._id,
      amount: numAmount,
      clientId,
      invoiceId
    });

    const populatedPayment = await Payment.findById(payment._id)
      .populate('clientId', 'companyName name contactPerson email')
      .populate('invoiceId', 'invoiceNumber totalAmount balance status');

    res.status(201).json({ success: true, data: populatedPayment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/v1/payments/:id
 * Update payment record (e.g. notes, verification status, payment method)
 */
export const updatePayment = async (req, res) => {
  try {
    const old = await Payment.findById(req.params.id);
    if (!old || old.deletedAt) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const { notes, paymentMethod, transactionReference, bankName, gatewayName, status, verificationStatus } = req.body;

    // Check duplicate reference if changed
    if (transactionReference && transactionReference.trim() !== old.transactionReference) {
      const cleanRef = transactionReference.trim();
      const existingRef = await Payment.findOne({
        transactionReference: cleanRef,
        _id: { $ne: old._id },
        deletedAt: null
      });
      if (existingRef) {
        return res.status(409).json({
          success: false,
          message: `Transaction reference "${cleanRef}" is already in use by another payment.`
        });
      }
      old.transactionReference = cleanRef;
    }

    if (notes !== undefined) old.notes = notes;
    if (paymentMethod !== undefined) old.paymentMethod = paymentMethod;
    if (bankName !== undefined) old.bankName = bankName;
    if (gatewayName !== undefined) old.gatewayName = gatewayName;
    if (status !== undefined) old.status = status;
    if (verificationStatus !== undefined) {
      old.verificationStatus = verificationStatus;
      if (verificationStatus === 'Verified') {
        old.verifiedBy = req.user?._id;
        old.verifiedAt = new Date();
      }
    }

    old.updatedBy = req.user?._id;
    await old.save();

    if (old.invoiceId) {
      await recalculateInvoice(old.invoiceId);
    }

    await logAudit({
      userId: req.user?._id,
      action: 'UPDATE_PAYMENT',
      module: 'Payment',
      recordId: old._id,
      oldValues: old.toObject(),
      newValues: old.toObject(),
      req
    });

    res.json({ success: true, data: old });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/v1/payments/:id
 * Soft delete / reverse a payment and restore invoice balance
 */
export const deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment || payment.deletedAt) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    payment.deletedAt = new Date();
    payment.status = 'Cancelled';
    payment.updatedBy = req.user?._id;
    await payment.save();

    if (payment.invoiceId) {
      await recalculateInvoice(payment.invoiceId);
    }

    await logAudit({
      userId: req.user?._id,
      action: 'DELETE_PAYMENT',
      module: 'Payment',
      recordId: payment._id,
      oldValues: payment.toObject(),
      req
    });

    res.json({ 
      success: true, 
      message: 'Payment reversed successfully and invoice balance recalculated' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
