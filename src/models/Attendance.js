import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  checkIn: { type: Date },
  checkOut: { type: Date },
  workHours: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Late Arrival', 'Early Exit', 'Half Day', 'WFH', 'Holiday', 'On Leave'], 
    default: 'Present' 
  },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);
