import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey_12345');
      req.user = await User.findById(decoded.id).select('-password').populate('role');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }
      return next();
    } catch (error) {
      console.log(`[Auth] JWT Verification Failed: ${error.message}`);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

export const authorize = (module, action) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Extract role name safely whether role is populated Object or String
    let roleName = '';
    if (typeof req.user.role === 'string') {
      roleName = req.user.role;
    } else if (req.user.role && req.user.role.name) {
      roleName = req.user.role.name;
    }

    // Default admin bypass for Super Admin, Admin, Management, CEO, Owner, or if role is missing/admin email
    const isAdminUser = 
      !roleName || 
      ['Super Admin', 'Admin', 'Management', 'CEO', 'Owner'].includes(roleName) ||
      (req.user.email && req.user.email.toLowerCase().includes('admin'));

    if (isAdminUser) {
      return next();
    }

    // Check specific permissions array for custom staff roles
    const permissions = (req.user.role && req.user.role.permissions) ? req.user.role.permissions : [];
    const hasPermission = permissions.some(p => 
      (p.module === module || p.module === 'All') && 
      (p.actions && (p.actions.includes(action) || p.actions.includes('All')))
    );

    if (hasPermission) {
      return next();
    } else {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: Role '${roleName}' requires ${action} permission on ${module}` 
      });
    }
  };
};
