import mongoose from 'mongoose';
const leadSchema = new mongoose.Schema({
  company: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true },
  status: { type: String, default: 'New' },
  value: { type: Number, default: 0 },
  salesperson: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
export default mongoose.model('Lead', leadSchema);