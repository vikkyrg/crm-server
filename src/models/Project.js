import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  projectId: { type: String, unique: true, sparse: true },
  projectName: { type: String, required: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  serviceType: { type: String },
  serviceCatalogIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCatalog' }],
  assignedServices: [{
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCatalog' },
    serviceName: { type: String },
    agreedPrice: { type: Number, default: 0 }
  }],
  startDate: { type: Date },
  expectedEndDate: { type: Date },
  actualEndDate: { type: Date },
  projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  budget: { type: Number, default: 0 },
  advanceType: { type: String, enum: ['Percentage', 'Fixed', 'None'], default: 'None' },
  advancePercentage: { type: Number, default: 0 },
  advanceRequired: { type: Number, default: 0 },
  milestoneSchedule: [{
    milestoneName: { type: String },
    percentage: { type: Number },
    amount: { type: Number },
    expectedDate: { type: Date },
    isBilled: { type: Boolean, default: false }
  }],
  quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation' },
  contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
  status: { 
    type: String, 
    enum: ['Planning', 'Active', 'On Hold', 'Delayed', 'Testing', 'Ready for Deployment', 'Completed', 'Cancelled'], 
    default: 'Planning' 
  },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  technology: [{ type: String }],
  repositoryUrl: { type: String },
  hostingDetails: { type: String },
  deploymentDetails: { type: String },
  warrantyStartDate: { type: Date },
  warrantyEndDate: { type: Date },
  warrantyDetails: { type: String },
  progressPercent: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
