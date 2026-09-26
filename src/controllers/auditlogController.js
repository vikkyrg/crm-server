import AuditLog from '../models/AuditLog.js';

export const getAuditLogs = async (req, res) => {
  try {
    const data = await AuditLog.find();
    res.json({ success: true, data, errors: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null, errors: [] });
  }
};

export const createAuditLog = async (req, res) => {
  try {
    const data = await AuditLog.create(req.body);
    res.status(201).json({ success: true, data, errors: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message, data: null, errors: [] });
  }
};