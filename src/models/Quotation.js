import mongoose from 'mongoose';

const quotationItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  description: { type: String },
  quantity: { type: Number, default: 1 },
  rate: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  taxPercent: { type: Number, default: 18 },
  amount: { type: Number, default: 0 }
});

const quotationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  quotationNumber: { type: String, unique: true, sparse: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  title: { type: String },
  date: { type: Date, default: Date.now },
  validUntil: { type: Date },
  salesperson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  description: { type: String },
  items: [quotationItemSchema],
  subtotal: { type: Number, default: 0 },
  discountTotal: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  terms: { type: String },
  paymentSchedule: { type: String },
  notes: { type: String },
  approvalStatus: { type: String, enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected'], default: 'Draft' },
  status: { 
    type: String, 
    enum: ['Draft', 'Pending Approval', 'Sent', 'Viewed', 'Negotiation', 'Accepted', 'Rejected', 'Expired', 'Cancelled'], 
    default: 'Draft' 
  },
  pdfUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Quotation || mongoose.model('Quotation', quotationSchema);
