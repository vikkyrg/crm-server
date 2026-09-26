import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  channel: { type: String, enum: ['In-app', 'Email', 'WhatsApp', 'Push', 'SMS'], default: 'In-app' },
  type: { type: String }, // 'Follow-up', 'Payment', 'Approval'
  title: { type: String, required: true },
  message: { type: String, required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  referenceType: { type: String },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  status: { type: String, enum: ['Pending', 'Sent', 'Failed'], default: 'Pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
