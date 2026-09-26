import jwt from 'jsonwebtoken';
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
      console.log(`[Auth] JWT Verification Failed: ${error.message}`);
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
      res.status(403).json({ success: false, message: `Forbidden: Requires ${action} permission on ${module}` });
    }
  };
};
