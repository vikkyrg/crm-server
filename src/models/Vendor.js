import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  vendorName: { type: String, required: true },
  contactPerson: { type: String },
  email: { type: String },
  phone: { type: String },
  serviceProvided: { type: String },
  gstNumber: { type: String },
  bankDetails: {
    bankName: String,
    accountNumber: String,
    ifscCode: String,
    upiId: String
  },
  performanceRating: { type: Number, min: 1, max: 5, default: 5 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
