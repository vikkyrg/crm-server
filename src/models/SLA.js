import mongoose from 'mongoose';

const slaSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  name: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], required: true },
  responseTimeHours: { type: Number, required: true },
  resolutionTimeHours: { type: Number, required: true },
  workingHours: { type: String, default: '9 AM - 6 PM IST' },
  escalationLevel: { type: Number, default: 1 },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.SLA || mongoose.model('SLA', slaSchema);
