import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCatalog' },
  description: { type: String },
  quantity: { type: Number, default: 1 },
  rate: { type: Number, default: 0 },
  amount: { type: Number, default: 0 }
});

const invoiceSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  invoiceNumber: { type: String, unique: true, sparse: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
  invoiceType: { type: String, enum: ['Standard', 'Advance', 'Milestone', 'AMC', 'Final'], default: 'Standard' },
  invoiceDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  items: [invoiceItemSchema],
  subtotal: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  creditedAmount: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Draft', 'Sent', 'Partially Paid', 'Paid', 'Overdue', 'Cancelled'], 
    default: 'Draft' 
  },
  notes: { type: String },
  pdfUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Invoice || mongoose.model('Invoice', invoiceSchema);
