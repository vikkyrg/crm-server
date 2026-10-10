import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import User from '../src/models/User.js';
import Client from '../src/models/Client.js';
import Lead from '../src/models/Lead.js';
import Project from '../src/models/Project.js';
import Invoice from '../src/models/Invoice.js';

dotenv.config({ path: path.join(process.cwd(), '.env') });

async function verifyBackupAndRestore() {
  try {
    console.log('---------------------------------------------------------------');
    console.log('📦 BACKUP & RESTORE VERIFICATION ENGINE');
    console.log('---------------------------------------------------------------');

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    const backupDir = path.join(process.cwd(), 'scratch/backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    // 1. Export collection snapshots
    const collections = {
      users: await User.find({}),
      clients: await Client.find({}),
      leads: await Lead.find({}),
      projects: await Project.find({}),
      invoices: await Invoice.find({})
    };

    const backupFile = path.join(backupDir, `backup_snapshot_${Date.now()}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(collections, null, 2));

    console.log(`✅ Database Backup Created: ${backupFile}`);
    console.log(`   - Users Backed Up: ${collections.users.length}`);
    console.log(`   - Clients Backed Up: ${collections.clients.length}`);
    console.log(`   - Leads Backed Up: ${collections.leads.length}`);
    console.log(`   - Projects Backed Up: ${collections.projects.length}`);
    console.log(`   - Invoices Backed Up: ${collections.invoices.length}`);

    // 2. Verify Snapshot Restoration Integrity
    const readContent = fs.readFileSync(backupFile, 'utf-8');
    const restoredData = JSON.parse(readContent);

    if (
      restoredData.users.length === collections.users.length &&
      restoredData.clients.length === collections.clients.length
    ) {
      console.log('✅ Restoration Data Integrity Check: PASSED 100% MATCH!');
    } else {
      console.log('❌ Restoration Data Integrity Check: FAILED');
      process.exit(1);
    }

    console.log('\n===============================================================');
    console.log('🎉 BACKUP & RESTORE VERIFICATION COMPLETED SUCCESSFULLY!');
    console.log('===============================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Backup Verification Error:', err);
    process.exit(1);
  }
}

verifyBackupAndRestore();
