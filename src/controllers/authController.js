import User from '../models/User.js';
import Role from '../models/Role.js';
import Session from '../models/Session.js';
import AuditLog from '../models/AuditLog.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretjwtkey_12345', {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).populate('role');
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'Locked') {
      return res.status(401).json({ success: false, message: 'Account is locked due to repeated failed logins. Contact Admin.' });
    }

    if (user.status === 'Inactive') {
      return res.status(401).json({ success: false, message: 'Account is deactivated.' });
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
      if (user.failedLoginAttempts >= 5) {
        user.status = 'Locked';
      }
      await user.save();

      await AuditLog.create({
        user: user._id,
        action: 'FAILED_LOGIN',
        module: 'Auth',
        ipAddress: req.ip,
        deviceInfo: req.headers['user-agent']
      });

      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.failedLoginAttempts = 0;
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    // Track Session
    await Session.create({
      userId: user._id,
      token,
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent']
    });

    // Audit Log
    await AuditLog.create({
      user: user._id,
      action: 'LOGIN',
      module: 'Auth',
      ipAddress: req.ip,
      deviceInfo: req.headers['user-agent']
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    if (req.user) {
      await Session.updateMany({ userId: req.user._id, isActive: true }, { isActive: false });
      await AuditLog.create({
        user: req.user._id,
        action: 'LOGOUT',
        module: 'Auth',
        ipAddress: req.ip,
        deviceInfo: req.headers['user-agent']
      });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('role').select('-password');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!await user.matchPassword(oldPassword)) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
