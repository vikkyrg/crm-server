import { sendInvoiceEmail } from './src/services/emailService.js';

async function testEmail() {
  console.log('Testing sendInvoiceEmail with unconfigured SMTP (default .env)...');
  const res1 = await sendInvoiceEmail({
    to: 'client@example.com',
    clientName: 'Acme Corp',
    invoiceNumber: 'INN-INV-000001',
    totalAmount: 118000,
    balance: 59000,
    dueDate: new Date(),
    viewUrl: 'http://localhost:5173/invoices'
  });
  console.log('Result 1 (no SMTP):', res1);

  if (res1.reason === 'SMTP_NOT_CONFIGURED') {
    console.log('✅ Graceful SMTP check verified!');
  } else {
    console.error('❌ Failed graceful SMTP check');
  }

  console.log('\nTesting validation when no email is provided...');
  try {
    await sendInvoiceEmail({});
    console.error('❌ Should have thrown validation error');
  } catch (err) {
    console.log('✅ Validation error caught as expected:', err.message);
  }
}

testEmail().then(() => console.log('Email test finished.'));
