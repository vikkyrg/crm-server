import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import User from './src/models/User.js';
import Role from './src/models/Role.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function fixAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Delete the corrupted user
    await User.deleteOne({ email: 'admin@innomatrics.com' });
    console.log('Removed old corrupted admin user.');

    // 2. Create the Role if it doesn't exist
    let superAdminRole = await Role.findOne({ name: 'Super Admin' });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'Super Admin',
        permissions: [] // or whatever schema Role has
      });
      console.log('Created Super Admin Role:', superAdminRole._id);
    }

    // 3. Create the User with the proper Role ObjectId
    // IMPORTANT: DON'T hash password here because User model has a pre-save hook that hashes it!
    // My previous script hashed it manually AND the pre-save hook hashed it again, making it impossible to login!
    const newAdmin = new User({
      name: 'Super Admin',
      email: 'admin@innomatrics.com',
      password: 'admin123',
      role: superAdminRole._id
    });
    
    await newAdmin.save();
    console.log('Successfully created valid Admin user with password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixAdmin();
