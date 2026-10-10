import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  code: { type: String },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String, default: 'India' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Branch || mongoose.model('Branch', branchSchema);
