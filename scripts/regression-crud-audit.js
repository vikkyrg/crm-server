import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../src/models/User.js';
import Client from '../src/models/Client.js';

const BASE_URL = 'http://localhost:5000/api/v1';
const MONGODB_URI = 'mongodb+srv://rvikky05_db_user:IYgYOHXGNhAkP7TG@cluster0.8uoyhvu.mongodb.net/innomatrics_crm';

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(data?.message || `HTTP ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runRegressionSuite() {
  console.log('--- STARTING CRM FULL CRUD AUTOMATED REGRESSION SUITE ---');

  // Connect to DB to get admin token and test client
  await mongoose.connect(MONGODB_URI);
  let user = await User.findOne({ email: /admin/i }) || await User.findOne();
  let client = await Client.findOne({ deletedAt: null });
  if (!client) {
    client = await Client.create({
      companyName: 'QA Primary Client',
      contactPerson: 'QA Contact',
      email: 'primary-client@qa.com',
      phone: '9999999999'
    });
  }
  const token = jwt.sign({ id: user._id }, 'supersecretjwtkey_12345', { expiresIn: '30d' });
  await mongoose.disconnect();

  const authHeaders = { Authorization: `Bearer ${token}` };
  console.log(`✔ Authenticated as Admin (${user.email}) with Client (${client.companyName})`);

  const results = [];

  const runTest = async (moduleName, fn) => {
    try {
      await fn();
      results.push({ module: moduleName, status: 'PASS' });
      console.log(`[PASS] ${moduleName}`);
    } catch (err) {
      results.push({ module: moduleName, status: 'FAIL', error: err.data?.message || err.message });
      console.error(`[FAIL] ${moduleName}:`, err.data || err.message);
    }
  };

  // Test 1: Leads CRUD
  await runTest('Leads CRUD (Create -> Read -> Update -> Delete)', async () => {
    const uniqueEmail = `qa-test-lead-${Date.now()}@example.com`;
    const createRes = await fetchJson(`${BASE_URL}/leads`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        companyName: 'QA Test Lead Corp',
        contactName: 'QA Tester',
        email: uniqueEmail,
        phone: '9876543210',
        estimatedBudget: 75000,
        serviceInterested: 'Web Development',
        status: 'New'
      })
    });
    const leadId = createRes.data._id;
    if (!leadId) throw new Error('Lead ID missing after creation');

    // Read single
    const readRes = await fetchJson(`${BASE_URL}/leads/${leadId}`, { headers: authHeaders });
    if (readRes.data.companyName !== 'QA Test Lead Corp') throw new Error('Lead read mismatch');

    // Update
    const updateRes = await fetchJson(`${BASE_URL}/leads/${leadId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        estimatedBudget: 90000,
        status: 'Qualified'
      })
    });
    if (updateRes.data.estimatedBudget !== 90000) throw new Error('Lead update not persisted');

    // Delete
    await fetchJson(`${BASE_URL}/leads/${leadId}`, { method: 'DELETE', headers: authHeaders });
  });

  // Test 2: Quotations CRUD
  await runTest('Quotations CRUD (Create -> Read -> Update -> Delete)', async () => {
    const createRes = await fetchJson(`${BASE_URL}/quotations`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'QA Test Proposal',
        items: [{ item: 'Design System', quantity: 1, rate: 25000 }],
        discountAmount: 2000,
        taxPercent: 18,
        status: 'Draft'
      })
    });
    const quoteId = createRes.data._id;
    if (!quoteId) throw new Error('Quotation ID missing after creation');

    // Update
    const updateRes = await fetchJson(`${BASE_URL}/quotations/${quoteId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'Sent',
        discountAmount: 3000
      })
    });
    if (updateRes.data.status !== 'Sent') throw new Error('Quotation status update not persisted');

    // Delete
    await fetchJson(`${BASE_URL}/quotations/${quoteId}`, { method: 'DELETE', headers: authHeaders });
  });

  // Test 3: Contracts CRUD
  await runTest('Contracts CRUD (Create -> Read -> Update -> Delete)', async () => {
    const now = new Date();
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const createRes = await fetchJson(`${BASE_URL}/contracts`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'QA Test SLA Contract',
        clientId: client._id,
        contractType: 'Service Agreement',
        startDate: now.toISOString(),
        endDate: nextYear.toISOString(),
        value: 120000,
        status: 'Active'
      })
    });
    const contractId = createRes.data._id;
    if (!contractId) throw new Error('Contract ID missing after creation');

    // Update
    const updateRes = await fetchJson(`${BASE_URL}/contracts/${contractId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        value: 150000,
        title: 'QA Test SLA Contract (Renewed)'
      })
    });
    if (updateRes.data.value !== 150000) throw new Error('Contract value update not persisted');

    // Delete
    await fetchJson(`${BASE_URL}/contracts/${contractId}`, { method: 'DELETE', headers: authHeaders });
  });

  // Test 4: Projects CRUD
  await runTest('Projects CRUD (Create -> Read -> Update -> Delete)', async () => {
    const createRes = await fetchJson(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        projectName: 'QA Full-Stack Portal Build',
        clientId: client._id,
        serviceType: 'Web Development',
        budget: 200000,
        status: 'Active'
      })
    });
    const projId = createRes.data._id;
    if (!projId) throw new Error('Project ID missing after creation');

    // Update
    const updateRes = await fetchJson(`${BASE_URL}/projects/${projId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'Completed',
        budget: 220000
      })
    });
    if (updateRes.data.budget !== 220000) throw new Error('Project update not persisted');

    // Delete
    await fetchJson(`${BASE_URL}/projects/${projId}`, { method: 'DELETE', headers: authHeaders });
  });

  // Test 5: AMC CRUD
  await runTest('AMC / Recurring CRUD (Create -> Read -> Update -> Delete)', async () => {
    const now = new Date();
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const createRes = await fetchJson(`${BASE_URL}/amc`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'QA Annual Maintenance Pack',
        clientId: client._id,
        coverageDetails: 'Server & Security Upgrades',
        startDate: now.toISOString(),
        endDate: nextYear.toISOString(),
        amcValue: 45000,
        renewalStatus: 'Active'
      })
    });
    const amcId = createRes.data._id;
    if (!amcId) throw new Error('AMC ID missing after creation');

    // Update
    const updateRes = await fetchJson(`${BASE_URL}/amc/${amcId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        amcValue: 50000,
        renewalStatus: 'Expiring Soon'
      })
    });
    if (updateRes.data.amcValue !== 50000) throw new Error('AMC update not persisted');

    // Delete
    await fetchJson(`${BASE_URL}/amc/${amcId}`, { method: 'DELETE', headers: authHeaders });
  });

  // Test 6: Tasks CRUD
  await runTest('Tasks CRUD (Create -> Read -> Update -> Delete)', async () => {
    const createRes = await fetchJson(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        taskName: 'QA Task Verification',
        priority: 'Urgent',
        status: 'To Do',
        estimatedHours: 6
      })
    });
    const taskId = createRes.data._id;
    if (!taskId) throw new Error('Task ID missing after creation');

    // Update
    const updateRes = await fetchJson(`${BASE_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'Completed',
        estimatedHours: 10
      })
    });
    if (updateRes.data.status !== 'Completed') throw new Error('Task update not persisted');

    // Delete
    await fetchJson(`${BASE_URL}/tasks/${taskId}`, { method: 'DELETE', headers: authHeaders });
  });

  // Test 7: Expenses CRUD
  await runTest('Expenses CRUD (Create -> Read -> Update -> Delete)', async () => {
    const createRes = await fetchJson(`${BASE_URL}/expenses`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        category: 'Software & Tools',
        amount: 4500,
        description: 'QA Tool Subscription',
        approvalStatus: 'Finance Approved'
      })
    });
    const expenseId = createRes.data._id;
    if (!expenseId) throw new Error('Expense ID missing after creation');

    // Update
    const updateRes = await fetchJson(`${BASE_URL}/expenses/${expenseId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        amount: 5200,
        description: 'QA Tool Subscription (Updated)'
      })
    });
    if (updateRes.data.amount !== 5200) throw new Error('Expense update not persisted');

    // Delete
    await fetchJson(`${BASE_URL}/expenses/${expenseId}`, { method: 'DELETE', headers: authHeaders });
  });

  // Test 8: Invoices CRUD
  await runTest('Invoices CRUD (Create -> Read -> Cancel -> Delete)', async () => {
    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    const createRes = await fetchJson(`${BASE_URL}/invoices`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        clientId: client._id,
        items: [{ item: 'QA Consulting', quantity: 1, rate: 10000 }],
        dueDate: dueDate.toISOString(),
        totalAmount: 11800,
        status: 'Draft'
      })
    });
    const invoiceId = createRes.data._id;
    if (!invoiceId) throw new Error('Invoice ID missing after creation');

    // Update / Cancel
    const updateRes = await fetchJson(`${BASE_URL}/invoices/${invoiceId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        status: 'Cancelled'
      })
    });
    if (updateRes.data.status !== 'Cancelled') throw new Error('Invoice cancel not persisted');

    // Delete
    await fetchJson(`${BASE_URL}/invoices/${invoiceId}`, { method: 'DELETE', headers: authHeaders });
  });

  console.log('\n--- REGRESSION SUMMARY ---');
  console.table(results);
  const allPass = results.every(r => r.status === 'PASS');
  console.log(`\nFinal Outcome: ${allPass ? 'ALL TESTS PASSED ✔' : 'SOME TESTS FAILED ✖'}`);
}

runRegressionSuite().catch(console.error);
