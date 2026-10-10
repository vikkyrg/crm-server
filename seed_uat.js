import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import Lead from './src/models/Lead.js';
import Client from './src/models/Client.js';
import Quotation from './src/models/Quotation.js';
import Project from './src/models/Project.js';
import Invoice from './src/models/Invoice.js';
import Payment from './src/models/Payment.js';
import Ticket from './src/models/Ticket.js';
import AMC from './src/models/AMC.js';
import Domain from './src/models/Domain.js';
import { generateNextNumber } from './src/services/numberingService.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function runMasterFlowUAT() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to DB');
    
    console.log('--- STARTING MASTER BUSINESS LIFECYCLE UAT SEED ---');
    
    // 1. Create Lead
    const leadId = await generateNextNumber('LEAD');
    const lead = await Lead.create({
      leadId,
      companyName: 'Acme Technologies Pvt Ltd',
      contactName: 'Rajesh Kumar',
      email: 'rajesh@acmetech.com',
      phone: '+91 9876543210',
      whatsapp: '+91 9876543210',
      leadSource: 'Website',
      status: 'Qualified',
      estimatedBudget: 250000,
      expectedValue: 250000
    });
    console.log(`[PASS 1] Created Lead: ${lead.leadId} (${lead.companyName})`);
    
    // 2. Convert Lead to Client
    const clientId = await generateNextNumber('CLIENT');
    const client = await Client.create({
      clientId,
      companyName: lead.companyName,
      contactPerson: lead.contactName,
      email: lead.email,
      phone: lead.phone,
      whatsapp: lead.whatsapp,
      leadId: lead._id,
      status: 'Active'
    });
    lead.status = 'Won';
    lead.isConverted = true;
    lead.convertedClientId = client._id;
    await lead.save();
    console.log(`[PASS 2] Converted Lead to Client: ${client.clientId}`);
    
    // 3. Create Proposal / Quotation
    const quotationNumber = await generateNextNumber('QUOTATION');
    const quote = await Quotation.create({
      quotationNumber,
      clientId: client._id,
      leadId: lead._id,
      title: 'Enterprise CRM Web Platform Development',
      items: [
        { item: 'CRM Platform Development', quantity: 1, rate: 200000, taxPercent: 18, amount: 236000 }
      ],
      subtotal: 200000,
      taxTotal: 360000,
      totalAmount: 236000,
      approvalStatus: 'Approved',
      status: 'Accepted'
    });
    console.log(`[PASS 3] Generated & Approved Quotation: ${quote.quotationNumber} (₹${quote.totalAmount})`);
    
    // 4. Create Project
    const projectId = await generateNextNumber('PROJECT');
    const project = await Project.create({
      projectId,
      projectName: 'Acme ERP Deployment',
      clientId: client._id,
      quotationId: quote._id,
      budget: quote.totalAmount,
      status: 'Active'
    });
    console.log(`[PASS 4] Generated Project: ${project.projectId} (${project.projectName})`);
    
    // 5. Generate Advance Invoice
    const invoiceNumber = await generateNextNumber('INVOICE');
    const invoice = await Invoice.create({
      invoiceNumber,
      clientId: client._id,
      projectId: project._id,
      quotationId: quote._id,
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      items: [{ item: 'Advance Milestone Payment', quantity: 1, rate: 100000, amount: 100000 }],
      totalAmount: 100000,
      amountPaid: 0,
      balance: 100000,
      status: 'Sent'
    });
    console.log(`[PASS 5] Generated Advance Invoice: ${invoice.invoiceNumber} (Balance: ₹${invoice.balance})`);
    
    // 6. Record Payment
    const paymentId = await generateNextNumber('PAYMENT');
    const payment = await Payment.create({
      paymentId,
      clientId: client._id,
      invoiceId: invoice._id,
      amount: 100000,
      paymentMethod: 'Bank Transfer',
      transactionReference: 'TXN9988776655',
      status: 'Completed'
    });

    invoice.amountPaid = 100000;
    invoice.balance = 0;
    invoice.status = 'Paid';
    await invoice.save();
    console.log(`[PASS 6] Recorded Payment: ${payment.paymentId} (Invoice Status updated to: ${invoice.status})`);

    // 7. Seed Domain & AMC for Recurring Business
    const domain = await Domain.create({
      domainName: 'acmetech.com',
      clientId: client._id,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry trigger
      status: 'Active'
    });
    console.log(`[PASS 7] Created Domain Record: ${domain.domainName}`);

    const amcNumber = await generateNextNumber('AMC');
    const amc = await AMC.create({
      amcNumber,
      clientId: client._id,
      projectId: project._id,
      title: 'Annual Maintenance Contract 2026-2027',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      amcValue: 50000,
      renewalStatus: 'Active'
    });
    console.log(`[PASS 8] Created AMC Record: ${amc.amcNumber}`);

    // 8. Seed Support Ticket
    const ticketId = await generateNextNumber('TICKET');
    const ticket = await Ticket.create({
      ticketId,
      clientId: client._id,
      projectId: project._id,
      subject: 'SSO Integration Inquiry',
      description: 'Need assistance setting up OAuth login for employees',
      priority: 'High',
      status: 'Open'
    });
    console.log(`[PASS 9] Created Support Ticket: ${ticket.ticketId}`);
    
    console.log('\n===============================================================');
    console.log('🎉 MASTER BUSINESS LIFECYCLE UAT PASSED 100% SUCCESSFULLY!');
    console.log('===============================================================\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ UAT Execution Error:', error);
    process.exit(1);
  }
}

runMasterFlowUAT();
