import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  userId,
  companyId = null,
  action,
  module,
  recordId = null,
  oldValues = null,
  newValues = null,
  req = null
}) => {
  try {
    const ipAddress = req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || null;
    const deviceInfo = req?.headers?.['user-agent'] || null;

    await AuditLog.create({
      user: userId,
      companyId,
      action,
      module,
      recordId,
      oldValues,
      newValues,
      ipAddress,
      deviceInfo
    });
  } catch (err) {
    console.error('Audit Logging Error:', err.message);
  }
};
