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
    const creditedAmount = old.creditedAmount || 0;
    const balance = Math.max(0, totalAmount - amountPaid - creditedAmount);

    let status = updatePayload.status || old.status;
    if (balance <= 0 && totalAmount > 0) status = 'Paid';
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

export const getInvoicePrintHtml = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('clientId')
      .populate('projectId');

    if (!invoice) {
      return res.status(404).send('<h2>Invoice not found</h2>');
    }

    const client = invoice.clientId || {};
    const project = invoice.projectId || {};
    const items = invoice.items || [];

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${invoice.invoiceNumber || 'Document'}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 40px; background: #fff; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #6366f1; padding-bottom: 24px; margin-bottom: 30px; }
    .company h1 { margin: 0 0 6px 0; font-size: 26px; color: #4338ca; letter-spacing: -0.5px; }
    .company p { margin: 2px 0; font-size: 12px; color: #64748b; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { margin: 0; font-size: 28px; color: #1e293b; letter-spacing: 1px; }
    .invoice-meta { margin-top: 8px; font-size: 13px; color: #475569; }
    .bill-to { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .box { width: 48%; }
    .box h3 { margin: 0 0 8px 0; font-size: 13px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
    .box p { margin: 2px 0; font-size: 14px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background: #f8fafc; color: #475569; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; padding: 12px; text-align: left; border-bottom: 1px solid #cbd5e1; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
    .text-right { text-align: right; }
    .totals { width: 320px; margin-left: auto; margin-bottom: 40px; }
    .totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #475569; }
    .totals-row.grand { border-top: 2px solid #1e293b; padding-top: 10px; font-size: 16px; font-weight: bold; color: #1e293b; }
    .totals-row.due { color: #dc2626; font-weight: bold; font-size: 15px; }
    .footer { border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #64748b; text-align: center; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px; text-align: right;">
    <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-size: 14px; cursor: pointer; font-weight: bold;">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div class="company">
      <h1>INNOMATRICS TECHNOLOGIES</h1>
      <p>Plot No 42, Cyber City, Hitech Zone</p>
      <p>Hyderabad, Telangana - 500081, India</p>
      <p>GSTIN: 36AAAAI1234A1Z5 | PAN: AAAAI1234A</p>
      <p>Email: billing@innomatrics.com | Phone: +91 40 4567 8900</p>
    </div>
    <div class="invoice-title">
      <h2>TAX INVOICE</h2>
      <div class="invoice-meta">
        <div><strong>Invoice #:</strong> ${invoice.invoiceNumber || 'N/A'}</div>
        <div><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString()}</div>
        <div><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</div>
        <div><strong>Status:</strong> ${invoice.status || 'Sent'}</div>
      </div>
    </div>
  </div>

  <div class="bill-to">
    <div class="box">
      <h3>Billed To:</h3>
      <p><strong>${client.companyName || 'Valued Client'}</strong></p>
      <p>Attn: ${client.contactPerson || 'Accounts Department'}</p>
      <p>${client.address || ''} ${client.city || ''} ${client.state || ''}</p>
      <p>GSTIN: ${client.gstNumber || 'Unregistered'}</p>
      <p>Email: ${client.email || 'N/A'} | Phone: ${client.phone || 'N/A'}</p>
    </div>
    <div class="box">
      <h3>Project Reference:</h3>
      <p><strong>${project.projectName || 'General Professional Services'}</strong></p>
      <p>Project Code: ${project.projectId || 'N/A'}</p>
      <p>Invoice Type: ${invoice.invoiceType || 'Standard'}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">#</th>
        <th style="width: 45%;">Service / Item Description</th>
        <th style="width: 15%;" class="text-right">Qty</th>
        <th style="width: 15%;" class="text-right">Rate (₹)</th>
        <th style="width: 20%;" class="text-right">Amount (₹)</th>
      </tr>
    </thead>
    <tbody>
      ${items.map((it, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${it.item}</strong><br><small style="color: #64748b;">${it.description || ''}</small></td>
          <td class="text-right">${it.quantity || 1}</td>
          <td class="text-right">₹${Number(it.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td class="text-right">₹${Number(it.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="totals">
    <div class="totals-row">
      <span>Subtotal:</span>
      <span>₹${Number(invoice.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    </div>
    ${(invoice.discountAmount || 0) > 0 ? `
    <div class="totals-row">
      <span>Discount:</span>
      <span>-₹${Number(invoice.discountAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    </div>` : ''}
    <div class="totals-row">
      <span>GST / Tax:</span>
      <span>₹${Number(invoice.taxAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="totals-row grand">
      <span>Total Amount:</span>
      <span>₹${Number(invoice.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    </div>
    <div class="totals-row">
      <span>Amount Paid:</span>
      <span>₹${Number(invoice.amountPaid || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    </div>
    ${(invoice.creditedAmount || 0) > 0 ? `
    <div class="totals-row">
      <span>Credit Adjustments:</span>
      <span>-₹${Number(invoice.creditedAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    </div>` : ''}
    <div class="totals-row due">
      <span>Balance Due:</span>
      <span>₹${Number(invoice.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
    </div>
  </div>

  <div class="footer">
    <p><strong>Payment Instructions:</strong> Bank: HDFC Bank | A/C: 50200012345678 | IFSC: HDFC0000123 | Branch: Cyberabad</p>
    <p>Thank you for partnering with Innomatrics Technologies Pvt Ltd. This is a computer-generated tax invoice.</p>
  </div>
</body>
</html>
    `;


    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    res.status(500).send(`<h2>Error rendering invoice: ${error.message}</h2>`);
  }
};

export const sendInvoiceEmailHandler = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('clientId');
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const recipientEmail = req.body.email || invoice.clientId?.email;
    if (!recipientEmail) {
      return res.status(400).json({ success: false, message: 'Recipient email address not found on client record' });
    }

    const { sendInvoiceEmail } = await import('../services/emailService.js');
    const result = await sendInvoiceEmail({
      to: recipientEmail,
      clientName: invoice.clientId?.companyName || 'Valued Client',
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: invoice.totalAmount,
      balance: invoice.balance,
      dueDate: invoice.dueDate,
      viewUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/invoices`
    });

    await logAudit({
      user: req.user?._id,
      action: 'EMAIL_DISPATCH',
      module: 'Invoice',
      recordId: invoice._id,
      details: {
        recipient: recipientEmail,
        status: result.dispatched ? 'SENT' : 'LOGGED_NO_SMTP',
        invoiceNumber: invoice.invoiceNumber
      },
      req
    });

    res.json({
      success: true,
      message: result.dispatched 
        ? `Invoice email sent successfully to ${recipientEmail}` 
        : `Email queued. (Notice: SMTP not configured in .env, logged to audit)`,
      details: result
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

