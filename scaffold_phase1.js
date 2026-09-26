import fs from 'fs';
import path from 'path';

const modelsDir = path.join(process.cwd(), 'src/models');
const middlewareDir = path.join(process.cwd(), 'src/middleware');

if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });
if (!fs.existsSync(middlewareDir)) fs.mkdirSync(middlewareDir, { recursive: true });

const files = {
  'src/models/User.js': `import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role' },
  status: { type: String, enum: ['Active', 'Inactive', 'Locked'], default: 'Active' },
  failedLoginAttempts: { type: Number, default: 0 },
  lastLogin: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', userSchema);
`,
  'src/models/Role.js': `import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  name: { type: String, required: true },
  description: { type: String },
  isSystem: { type: Boolean, default: false }, // System roles cannot be deleted
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  permissions: [{
    module: { type: String, required: true },
    submodule: { type: String },
    actions: [{ type: String }] // e.g., 'view', 'create', 'edit', 'delete', 'approve'
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
}, { timestamps: true });

export default mongoose.model('Role', roleSchema);
`,
  'src/models/AuditLog.js': `import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true }, // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
  module: { type: String, required: true },
  recordId: { type: mongoose.Schema.Types.ObjectId },
  oldValues: { type: mongoose.Schema.Types.Mixed },
  newValues: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  deviceInfo: { type: String }
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);
`,
  'src/models/Setting.js': `import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  category: { type: String, required: true }, // e.g., 'General', 'Email', 'Payment'
  key: { type: String, required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  isPublic: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Setting', settingSchema);
`,
  'src/models/Numbering.js': `import mongoose from 'mongoose';

const numberingSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  module: { type: String, required: true, unique: true }, // e.g., 'LEAD', 'INVOICE'
  prefix: { type: String, required: true }, // e.g., 'INN-LEAD-'
  currentNumber: { type: Number, default: 0 },
  padding: { type: Number, default: 6 }, // e.g., 6 -> 000001
  suffix: { type: String, default: '' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('Numbering', numberingSchema);
`,
  'src/models/CustomField.js': `import mongoose from 'mongoose';

const customFieldSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  module: { type: String, required: true }, // e.g., 'Client', 'Project'
  fieldName: { type: String, required: true },
  fieldType: { type: String, enum: ['Text', 'Number', 'Date', 'Select', 'Boolean'], required: true },
  options: [{ type: String }], // for Select type
  isRequired: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('CustomField', customFieldSchema);
`,
  'src/models/CustomStatus.js': `import mongoose from 'mongoose';

const customStatusSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  module: { type: String, required: true }, // e.g., 'Lead', 'Project'
  statusName: { type: String, required: true },
  colorCode: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export default mongoose.model('CustomStatus', customStatusSchema);
`,
  'src/middleware/auth.js': `import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Role from '../models/Role.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.user = await User.findById(decoded.id).select('-password').populate('role');
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

export const authorize = (module, action) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ success: false, message: 'Forbidden: No role assigned' });
    }
    
    const permissions = req.user.role.permissions;
    const hasPermission = permissions.some(p => 
      p.module === module && p.actions.includes(action)
    );
    
    // Admins usually have a wildcard or 'All' permission bypass
    if (req.user.role.name === 'Super Admin' || hasPermission) {
      next();
    } else {
      res.status(403).json({ success: false, message: \`Forbidden: Requires \${action} permission on \${module}\` });
    }
  };
};
`,
  'src/middleware/audit.js': `import AuditLog from '../models/AuditLog.js';

export const auditAction = (module, action) => {
  return async (req, res, next) => {
    // We capture the original send to intercept the response and log it
    const originalSend = res.json;
    res.json = function (body) {
      res.json = originalSend;
      
      // If successful request (e.g. POST, PUT, DELETE)
      if (res.statusCode >= 200 && res.statusCode < 300 && ['POST', 'PUT', 'DELETE'].includes(req.method)) {
         const log = new AuditLog({
           user: req.user ? req.user._id : null,
           action: action || req.method,
           module: module,
           ipAddress: req.ip,
           deviceInfo: req.headers['user-agent'],
           // To truly get old/new values, business logic needs to pass them.
           // For now we log basic request info.
           newValues: req.body
         });
         log.save().catch(err => console.error('Audit Log Error:', err));
      }
      
      return res.json(body);
    };
    next();
  };
};
`
};

for (const [filepath, content] of Object.entries(files)) {
  const fullPath = path.join(process.cwd(), filepath);
  fs.writeFileSync(fullPath, content);
  console.log('Wrote', filepath);
}
console.log('Phase 1 Foundation models and middleware scaffolded.');
