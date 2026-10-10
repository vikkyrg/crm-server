import mongoose from 'mongoose';

const mobileAppSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  appId: { type: String, unique: true, sparse: true },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  appName: { type: String, required: true },
  androidPackage: { type: String },
  iosBundleId: { type: String },
  technology: { type: String, enum: ['Flutter', 'React Native', 'Android Native', 'iOS Native', 'Other'], default: 'Flutter' },
  firebaseProject: { type: String },
  repositoryUrl: { type: String },
  apiBaseUrl: { type: String },
  serverIp: { type: String },
  databaseType: { type: String },
  playStoreUrl: { type: String },
  appStoreUrl: { type: String },
  version: { type: String, default: '1.0.0' },
  currentProductionVersion: { type: String, default: '1.0.0' },
  lastReleaseDate: { type: Date },
  signingReference: { type: String }, // Encrypted reference
  status: { type: String, enum: ['Live', 'In Development', 'Testing', 'Suspended'], default: 'Live' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.models.MobileApp || mongoose.model('MobileApp', mobileAppSchema);
