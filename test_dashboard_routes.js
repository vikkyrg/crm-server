import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

import User from './src/models/User.js';
import jwt from 'jsonwebtoken';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function testDashboardEndpoints() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const admin = await User.findOne({ email: 'admin@innomatrics.com' });
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET || 'supersecretjwtkey_12345', { expiresIn: '1d' });

    console.log('Testing Dashboard Endpoints against live Express server...');

    const baseUrl = 'http://localhost:5000/api/v1';
    const endpoints = [
      '/dashboard/metrics',
      '/dashboard/ceo-view',
      '/dashboard/action-center',
      '/leads',
      '/clients',
      '/projects',
      '/invoices',
      '/tickets'
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(`${baseUrl}${ep}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.status === 200 && data.success) {
          console.log(`✅ [PASS 200 OK] ${ep}`);
        } else {
          console.log(`❌ [FAIL ${res.status}] ${ep} - ${data.message || 'Error'}`);
        }
      } catch (err) {
        console.log(`⚠️ Server not responding on port 5000: ${err.message}`);
        break;
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Test Error:', err.message);
    process.exit(1);
  }
}

testDashboardEndpoints();
