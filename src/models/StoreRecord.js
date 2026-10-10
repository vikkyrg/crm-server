import mongoose from 'mongoose';

const storeRecordSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  developerAccount: { type: String, required: true },
  appId: { type: mongoose.Schema.Types.ObjectId, ref: 'MobileApp' },
  packageId: { type: String, required: true },
  bundleId: { type: String },
  version: { type: String, default: '1.0.0' },
  buildNumber: { type: String, default: '1' },
  releaseDate: { type: Date },
  reviewStatus: { type: String, enum: ['In Review', 'Approved', 'Rejected', 'Draft'], default: 'Draft' },
  productionStatus: { type: String, enum: ['Published', 'Unpublished', 'Suspended'], default: 'Published' },
  testStatus: { type: String, enum: ['Internal Testing', 'Beta', 'Closed Testing', 'None'], default: 'None' },
  rejectionHistory: [{
    date: Date,
    reason: String
  }],
  storeCredentialsRef: { type: String }, // Encrypted reference
  supportUrl: { type: String },
  privacyPolicyUrl: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.StoreRecord || mongoose.model('StoreRecord', storeRecordSchema);
