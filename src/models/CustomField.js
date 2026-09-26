import mongoose from 'mongoose';

const customFieldSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  module: { type: String, required: true }, // e.g., 'Client', 'Project'
  fieldName: { type: String, required: true },
  fieldType: { type: String, enum: ['Text', 'Number', 'Date', 'Select', 'Boolean'], required: true },
  options: [{ type: String }], // for Select type
  isRequired: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('CustomField', customFieldSchema);
