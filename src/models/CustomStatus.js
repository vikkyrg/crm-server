import mongoose from 'mongoose';

const customStatusSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  module: { type: String, required: true }, // e.g., 'Lead', 'Project'
  statusName: { type: String, required: true },
  colorCode: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('CustomStatus', customStatusSchema);
