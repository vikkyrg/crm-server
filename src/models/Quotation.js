import mongoose from 'mongoose';

const quotationItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  rate: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const quotationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  quotationNumber: { type: String, required: true, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  date: { type: Date, required: true, default: Date.now },
  validUntil: { type: Date },
  salesperson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String },
  items: [quotationItemSchema],
  subtotal: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  totalTax: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  terms: { type: String },
  paymentSchedule: { type: String },
  notes: { type: String },
  status: { 
    type: String, 
    enum: ['Draft', 'Pending Approval', 'Sent', 'Viewed', 'Negotiation', 'Accepted', 'Rejected', 'Expired', 'Cancelled'], 
    default: 'Draft' 
  },
  approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Quotation', quotationSchema);
