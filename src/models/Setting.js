import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  category: { type: String, required: true }, // e.g., 'General', 'Email', 'Payment'
  key: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  isPublic: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Setting', settingSchema);
