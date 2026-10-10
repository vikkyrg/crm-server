import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  title: { type: String, required: true },
  category: { type: String, enum: ['Client', 'Employee', 'Project', 'Contract', 'Vendor', 'Invoice', 'Asset', 'Domain', 'Website', 'Application', 'General'], default: 'General' },
  relatedRecordId: { type: mongoose.Schema.Types.ObjectId },
  fileUrl: { type: String, required: true },
  fileName: { type: String },
  fileType: { type: String },
  fileSizeBytes: { type: Number },
  version: { type: Number, default: 1 },
  expiryDate: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Document || mongoose.model('Document', documentSchema);
