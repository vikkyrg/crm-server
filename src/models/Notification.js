import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  channel: { type: String, enum: ['In-app', 'Email', 'WhatsApp', 'Push', 'SMS'], default: 'In-app' },
  type: { type: String, default: 'System' }, // 'Follow-up', 'Payment', 'Approval', 'Workflow', 'System'
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  referenceType: { type: String },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  status: { type: String, enum: ['Pending', 'Sent', 'Failed'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
