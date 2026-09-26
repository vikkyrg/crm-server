import AuditLog from '../models/AuditLog.js';

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
