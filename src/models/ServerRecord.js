import mongoose from 'mongoose';

const serverRecordSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  serverName: { type: String, required: true },
  provider: { type: String, required: true }, // e.g., AWS, Hetzner, DigitalOcean, Hostinger
  ipAddress: { type: String, required: true },
  region: { type: String },
  operatingSystem: { type: String },
  cpuCores: { type: Number },
  ramGb: { type: Number },
  storageGb: { type: Number },
  environment: { type: String, enum: ['Development', 'Staging', 'Production'], default: 'Production' },
  applications: [{ type: String }],
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  monitoringStatus: { type: String, enum: ['Healthy', 'Warning', 'Down'], default: 'Healthy' },
  backupStatus: { type: String, enum: ['Active', 'Inactive', 'Failed'], default: 'Active' },
  renewalDate: { type: Date },
  status: { type: String, enum: ['Active', 'Maintenance', 'Terminated'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.ServerRecord || mongoose.model('ServerRecord', serverRecordSchema);
