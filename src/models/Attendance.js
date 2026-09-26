import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  workHours: { type: Number, default: 0 },
  status: { type: String, enum: ['Present', 'Absent', 'Late', 'Half day', 'Leave', 'Holiday', 'WFH'], required: true },
  overtimeHours: { type: Number, default: 0 },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Attendance', attendanceSchema);
