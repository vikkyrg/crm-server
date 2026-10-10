import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  repositoryName: { type: String, required: true },
  provider: { type: String, enum: ['GitHub', 'GitLab', 'Bitbucket', 'Other'], default: 'GitHub' },
  organization: { type: String },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  repositoryUrl: { type: String, required: true },
  mainBranch: { type: String, default: 'main' },
  developmentBranch: { type: String, default: 'dev' },
  stagingBranch: { type: String, default: 'staging' },
  productionBranch: { type: String, default: 'production' },
  ownerUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  accessLevel: { type: String, enum: ['Private', 'Internal', 'Public'], default: 'Private' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Repository || mongoose.model('Repository', repositorySchema);
