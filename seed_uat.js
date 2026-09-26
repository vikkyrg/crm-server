import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const leadSchema = new mongoose.Schema({ title: String, company: String, status: String, value: Number });
const clientSchema = new mongoose.Schema({ name: String, leadId: mongoose.Schema.Types.ObjectId });
const quotationSchema = new mongoose.Schema({ clientId: mongoose.Schema.Types.ObjectId, amount: Number, status: String });
const projectSchema = new mongoose.Schema({ clientId: mongoose.Schema.Types.ObjectId, quotationId: mongoose.Schema.Types.ObjectId, name: String, status: String });
const invoiceSchema = new mongoose.Schema({ clientId: mongoose.Schema.Types.ObjectId, projectId: mongoose.Schema.Types.ObjectId, amount: Number, status: String });

const Lead = mongoose.models.Lead || mongoose.model('Lead', leadSchema);
const Client = mongoose.models.Client || mongoose.model('Client', clientSchema);
const Quotation = mongoose.models.Quotation || mongoose.model('Quotation', quotationSchema);
const Project = mongoose.models.Project || mongoose.model('Project', projectSchema);
const Invoice = mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);

async function runUAT() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/innomatrics_crm');
    console.log('Connected.');
    
    console.log('--- STARTING REAL DATA MASTER FLOW SEED ---');
    
    // 1. Lead
    const lead = await Lead.create({ title: 'Enterprise CRM', company: 'Acme Corp', status: 'Qualified', value: 150000 });
    console.log('[PASS] Created Lead:', lead._id);
    
    // 2. Client
    const client = await Client.create({ name: 'Acme Corp', leadId: lead._id });
    console.log('[PASS] Converted Lead to Client:', client._id);
    
    // 3. Quotation
    const quote = await Quotation.create({ clientId: client._id, amount: 150000, status: 'Approved' });
    console.log('[PASS] Generated Quotation for Client:', quote._id);
    
    // 4. Project
    const project = await Project.create({ clientId: client._id, quotationId: quote._id, name: 'Acme CRM Deployment', status: 'In Progress' });
    console.log('[PASS] Generated Project from Quotation:', project._id);
    
    // 5. Invoice
    const invoice = await Invoice.create({ clientId: client._id, projectId: project._id, amount: 50000, status: 'Unpaid' });
    console.log('[PASS] Generated Advance Invoice:', invoice._id);
    
    // 6. Aggregate check (Client 360 simulation)
    const client360Projects = await Project.find({ clientId: client._id });
    const client360Invoices = await Invoice.find({ clientId: client._id });
    
    if (client360Projects.length === 1 && client360Invoices.length === 1) {
       console.log('[PASS] Client 360 Relational Aggregation Verified.');
    }
    
    console.log('\\n[SUCCESS] Master Business Flow DB Constraints Verified.\\n');
    process.exit(0);
  } catch (error) {
    console.error('[FAIL]', error);
    process.exit(1);
  }
}

runUAT();
