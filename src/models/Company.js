import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  legalName: { type: String },
  gstNumber: { type: String },
  panNumber: { type: String },
  email: { type: String },
  phone: { type: String },
  website: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  country: { type: String, default: 'India' },
  currency: { type: String, default: 'INR' },
  logoUrl: { type: String },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Company || mongoose.model('Company', companySchema);
