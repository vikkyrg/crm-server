import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  name: { type: String, required: true },
  description: { type: String },
  isSystem: { type: Boolean, default: false }, // System roles cannot be deleted
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  permissions: [{
    module: { type: String, required: true },
    submodule: { type: String },
    actions: [{ type: String }] // e.g., 'view', 'create', 'edit', 'delete', 'approve'
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);
