import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  assetId: { type: String, unique: true, sparse: true },
  assetType: { type: String, enum: ['Laptop', 'Desktop', 'Mobile', 'SIM', 'Monitor', 'Accessories', 'Software', 'Other'], required: true },
  assetName: { type: String, required: true },
  serialNumber: { type: String },
  assignedEmployee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  issueDate: { type: Date },
  returnDate: { type: Date },
  condition: { type: String, enum: ['New', 'Good', 'Fair', 'Damaged'], default: 'Good' },
  status: { type: String, enum: ['Assigned', 'In Stock', 'Under Repair', 'Scrapped'], default: 'In Stock' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.Asset || mongoose.model('Asset', assetSchema);
