import mongoose from 'mongoose';

const backupSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  backupType: { type: String, enum: ['Website', 'Database', 'Server', 'Source Code', 'Documents'], required: true },
  sourceName: { type: String, required: true },
  destinationPath: { type: String },
  frequency: { type: String, enum: ['Daily', 'Weekly', 'Monthly', 'Manual'], default: 'Daily' },
  lastSuccessfulBackup: { type: Date },
  lastFailedBackup: { type: Date },
  retentionDays: { type: Number, default: 30 },
  status: { type: String, enum: ['Success', 'Failed', 'In Progress'], default: 'Success' },
  failureReason: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.Backup || mongoose.model('Backup', backupSchema);
