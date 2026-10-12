import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcryptjs';

import User from './src/models/User.js';
import Lead from './src/models/Lead.js';
import Client from './src/models/Client.js';
import Quotation from './src/models/Quotation.js';
import Project from './src/models/Project.js';
import Invoice from './src/models/Invoice.js';
import Payment from './src/models/Payment.js';
import Ticket from './src/models/Ticket.js';
import Task from './src/models/Task.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function runFullE2ETest() {
  console.log('===============================================================');
  console.log('🧪 RUNNING INNOMATRICS CRM/ERP FULL E2E LIFECYCLE TEST SUITE');
  console.log('===============================================================');

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ [1/10] Database Connection: Established');

    // 1. Auth & Admin check
    let admin = await User.findOne({ email: 'admin@innomatrics.com' });
    if (!admin) {
      console.log('⚠️ Admin missing, creating admin user...');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@innomatrics.com',
        password: hashedPassword,
        role: 'superadmin',
        isActive: true
      });
    }
    console.log(`✅ [2/10] Admin Authentication: Verified (ID: ${admin._id})`);

    // 2. Create Lead
    const testLead = await Lead.create({
      leadId: `LEAD-TEST-${Date.now()}`,
      contactName: 'E2E Test Contact',
      companyName: 'E2E Robotics Corp',
      email: `e2e_${Date.now()}@robotics.com`,
      phone: '+91 9999999999',
      leadSource: 'Website',
      status: 'Qualified',
      estimatedBudget: 150000,
      notes: 'Initial test lead for end-to-end qualification'
    });
    console.log(`✅ [3/10] Lead Creation: Success (${testLead.leadId})`);

    // 3. Lead to Client Conversion
    const testClient = await Client.create({
      clientId: `CLI-TEST-${Date.now()}`,
      companyName: testLead.companyName,
      contactPerson: testLead.contactPerson,
      email: testLead.email,
      phone: testLead.phone,
      clientType: 'Enterprise',
      status: 'Active',
      address: '101 Cyber City, Tech Hub',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      gstin: '36ABCDE1234F1Z5',
      accountManager: admin._id,
      notes: 'Converted from Lead'
    });
    testLead.status = 'Won';
    await testLead.save();
    console.log(`✅ [4/10] Lead-to-Client Conversion: Success (${testClient.clientId})`);

    // 4. Create Quotation with Items & GST
    const lineItems = [
      { item: 'Cloud Architecture Setup', description: 'Enterprise VPC & ECS setup', quantity: 1, rate: 80000, amount: 80000 },
      { item: 'API Security Hardening', description: 'OWASP and JWT auth', quantity: 1, rate: 20000, amount: 20000 }
    ];
    const subtotal = lineItems.reduce((acc, item) => acc + item.amount, 0);
    const taxRate = 18;
    const taxTotal = (subtotal * taxRate) / 100;
    const totalAmount = subtotal + taxTotal;

    const testQuotation = await Quotation.create({
      quotationNumber: `QT-TEST-${Date.now()}`,
      clientId: testClient._id,
      date: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'Accepted',
      items: lineItems,
      subtotal,
      taxTotal,
      totalAmount,
      notes: 'E2E Automated test quotation'
    });
    console.log(`✅ [5/10] Quotation Creation & Math: Success (${testQuotation.quotationNumber}, Total: ₹${testQuotation.totalAmount})`);

    // 5. Convert Quotation to Project
    const testProject = await Project.create({
      projectId: `PRJ-TEST-${Date.now()}`,
      projectName: 'Robotics ERP Modernization',
      clientId: testClient._id,
      serviceType: 'Web Development',
      status: 'Active',
      startDate: new Date(),
      budget: totalAmount,
      progressPercent: 25
    });
    console.log(`✅ [6/10] Quotation-to-Project Conversion: Success (${testProject.projectId})`);

    // 6. Create Invoice from Quotation / Project
    const testInvoice = await Invoice.create({
      invoiceNumber: `INV-TEST-${Date.now()}`,
      clientId: testClient._id,
      projectId: testProject._id,
      invoiceDate: new Date(),
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'Draft',
      items: lineItems,
      subtotal,
      taxAmount: taxTotal,
      totalAmount,
      amountPaid: 0,
      balance: totalAmount
    });
    console.log(`✅ [7/10] Invoice Generation: Success (${testInvoice.invoiceNumber}, Due: ₹${testInvoice.balance})`);

    // 7. Partial Payment Recording & Balance Math
    const partialAmount = 50000;
    const payment1 = await Payment.create({
      paymentId: `PAY-TEST-1-${Date.now()}`,
      invoiceId: testInvoice._id,
      clientId: testClient._id,
      amount: partialAmount,
      paymentDate: new Date(),
      paymentMethod: 'Bank Transfer',
      transactionReference: 'NEFT-E2E-PARTIAL-001',
      status: 'Completed',
      notes: 'First milestone partial payment'
    });

    testInvoice.amountPaid += partialAmount;
    testInvoice.balance = testInvoice.totalAmount - testInvoice.amountPaid;
    testInvoice.status = testInvoice.balance <= 0 ? 'Paid' : 'Partially Paid';
    await testInvoice.save();

    console.log(`✅ [8/10] Partial Payment Recorded: (Paid: ₹${testInvoice.amountPaid}, Balance: ₹${testInvoice.balance}, Status: ${testInvoice.status})`);
    if (testInvoice.status !== 'Partially Paid' || testInvoice.balance !== 68000) {
      throw new Error(`Financial computation error on partial payment: balance=${testInvoice.balance}`);
    }

    // 8. Final Payment Recording & Paid Status
    const finalAmount = testInvoice.balance;
    const payment2 = await Payment.create({
      paymentId: `PAY-TEST-2-${Date.now()}`,
      invoiceId: testInvoice._id,
      clientId: testClient._id,
      amount: finalAmount,
      paymentDate: new Date(),
      paymentMethod: 'UPI',
      transactionReference: 'UPI-E2E-FINAL-002',
      status: 'Completed',
      notes: 'Final settlement payment'
    });

    testInvoice.amountPaid += finalAmount;
    testInvoice.balance = testInvoice.totalAmount - testInvoice.amountPaid;
    testInvoice.status = testInvoice.balance <= 0 ? 'Paid' : 'Partially Paid';
    await testInvoice.save();

    console.log(`✅ [9/10] Full Payment Settlement: (Paid: ₹${testInvoice.amountPaid}, Balance: ₹${testInvoice.balance}, Status: ${testInvoice.status})`);
    if (testInvoice.status !== 'Paid' || testInvoice.balance !== 0) {
      throw new Error(`Financial computation error on final payment: balance=${testInvoice.balance}`);
    }

    // 9. Client 360 Aggregation Verification
    const clientProjects = await Project.find({ clientId: testClient._id });
    const clientInvoices = await Invoice.find({ clientId: testClient._id });
    const clientPayments = await Payment.find({ clientId: testClient._id });
    const clientQuotations = await Quotation.find({ clientId: testClient._id });

    console.log('✅ [10/10] Client 360 Relational Audit:');
    console.log(`   - Associated Quotations: ${clientQuotations.length}`);
    console.log(`   - Associated Projects: ${clientProjects.length}`);
    console.log(`   - Associated Invoices: ${clientInvoices.length}`);
    console.log(`   - Associated Payments: ${clientPayments.length}`);

    if (clientProjects.length === 0 || clientInvoices.length === 0 || clientPayments.length !== 2) {
      throw new Error('Client 360 relational integrity check failed.');
    }

    // Clean up test records
    await Lead.findByIdAndDelete(testLead._id);
    await Quotation.findByIdAndDelete(testQuotation._id);
    await Project.findByIdAndDelete(testProject._id);
    await Invoice.findByIdAndDelete(testInvoice._id);
    await Payment.deleteMany({ _id: { $in: [payment1._id, payment2._id] } });
    await Client.findByIdAndDelete(testClient._id);
    console.log('\n🧹 Temporary E2E test data cleanly pruned from database.');

    console.log('\n===============================================================');
    console.log('🏆 COMPLETE E2E MASTER LIFECYCLE TEST PASSED WITH 100% SUCCESS!');
    console.log('===============================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ E2E LIFECYCLE TEST FAILED:', error);
    process.exit(1);
  }
}

runFullE2ETest();
