import mongoose from 'mongoose';

const credentialSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  title: { type: String, required: true },
  serviceCategory: { 
    type: String, 
    enum: ['API Keys', 'Firebase', 'AWS', 'Hosting', 'Database', 'Payment Gateway', 'Email', 'WhatsApp', 'Third Party Services'],
    required: true 
  },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  encryptedSecret: { type: String, required: true },
  restrictedRoleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  accessHistory: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    accessedAt: { type: Date, default: Date.now },
    ipAddress: String
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.Credential || mongoose.model('Credential', credentialSchema);
