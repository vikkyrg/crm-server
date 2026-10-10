import mongoose from 'mongoose';

const websiteSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  websiteId: { type: String, unique: true, sparse: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  domainName: { type: String, required: true },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  websiteType: { 
    type: String, 
    enum: ['Corporate', 'Business', 'E-commerce', 'Custom Web Application', 'WordPress', 'PHP', 'React', 'Laravel', 'Other'],
    default: 'Corporate'
  },
  technologyStack: [{ type: String }],
  framework: { type: String },
  repositoryUrl: { type: String },
  hostingProvider: { type: String },
  serverIp: { type: String },
  sslStatus: { type: String, enum: ['Active', 'Expired', 'Pending', 'N/A'], default: 'Active' },
  databaseType: { type: String },
  deploymentDate: { type: Date },
  renewalDate: { type: Date },
  hasAmc: { type: Boolean, default: false },
  amcId: { type: mongoose.Schema.Types.ObjectId, ref: 'AMC' },
  status: { type: String, enum: ['Live', 'Development', 'Maintenance', 'Suspended'], default: 'Live' },
  loginReferences: { type: String }, // Encrypted reference
  backupStatus: { type: String, enum: ['Daily', 'Weekly', 'Failed', 'None'], default: 'Weekly' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Website || mongoose.model('Website', websiteSchema);
