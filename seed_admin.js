import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Super Admin', 'Admin', 'Sales', 'Project Manager', 'Finance', 'Support', 'Employee', 'Client'], default: 'Employee' },
  isActive: { type: Boolean, default: true }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const existing = await User.findOne({ email: 'admin@innomatrics.com' });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Super Admin',
        email: 'admin@innomatrics.com',
        password: hashedPassword,
        role: 'Super Admin'
      });
      console.log('Default admin seeded: admin@innomatrics.com / admin123');
    } else {
      console.log('Admin already exists.');
    }
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
seedAdmin();
