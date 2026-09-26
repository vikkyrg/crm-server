import mongoose from 'mongoose';

const websiteSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  websiteId: { type: String, required: true, unique: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  domainId: { type: mongoose.Schema.Types.ObjectId, ref: 'Domain' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  websiteType: { type: String, enum: ['Corporate', 'Business', 'E-commerce', 'Custom web application', 'WordPress', 'PHP', 'React', 'Laravel', 'Other'] },
  technology: { type: String },
  framework: { type: String },
  repositoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository' },
  hostingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hosting' },
  serverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Server' },
  sslId: { type: mongoose.Schema.Types.ObjectId, ref: 'SSL' },
  deploymentDate: { type: Date },
  renewalDate: { type: Date },
  amcId: { type: mongoose.Schema.Types.ObjectId, ref: 'AMC' },
  status: { type: String, enum: ['Active', 'Inactive', 'Maintenance'], default: 'Active' },
  backupStatus: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Website', websiteSchema);
