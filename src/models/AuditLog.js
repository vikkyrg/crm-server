import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
  module: { type: String, required: true },
  recordId: { type: mongoose.Schema.Types.ObjectId },
  oldValues: { type: mongoose.Schema.Types.Mixed },
  newValues: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  deviceInfo: { type: String }
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
