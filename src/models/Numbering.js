import mongoose from 'mongoose';

const numberingSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  module: { type: String, required: true, unique: true }, // e.g., 'LEAD', 'INVOICE'
  prefix: { type: String, required: true }, // e.g., 'INN-LEAD-'
  currentNumber: { type: Number, default: 0 },
  padding: { type: Number, default: 6 }, // e.g., 6 -> 000001
  suffix: { type: String, default: '' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Numbering', numberingSchema);
