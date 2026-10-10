import cron from 'node-cron';
import Domain from '../models/Domain.js';
import { createNotification } from './notificationService.js';
import { logAudit } from './auditService.js';

// Helper to calculate diff in days
const getDaysRemaining = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  const diffTime = expiry - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const initCronJobs = () => {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] Running daily domain expiry check...');
    try {
      const domains = await Domain.find({ status: { $ne: 'Expired' }, deletedAt: null }).populate('responsibleEmployee', 'name email');
      
      for (const domain of domains) {
        const days = getDaysRemaining(domain.expiryDate);
        
        let shouldNotify = false;
        let priority = 'Normal';
        
        // Notification logic thresholds
        if ([90, 60, 30, 15, 7, 3, 1, 0].includes(days) || days < 0) {
          shouldNotify = true;
          if (days <= 7 && days > 0) priority = 'High';
          if (days <= 0) priority = 'Urgent';
        }

        // Update renewalStatus dynamically if needed
        let statusUpdated = false;
        if (days <= 0 && domain.renewalStatus !== 'Expired') {
          domain.renewalStatus = 'Expired';
          statusUpdated = true;
        } else if (days > 0 && days <= 30 && domain.renewalStatus !== 'Due') {
          domain.renewalStatus = 'Due';
          statusUpdated = true;
        }

        if (statusUpdated) {
          await domain.save();
        }

        if (shouldNotify) {
          let message = `Domain ${domain.domainName} expires in ${days} days.`;
          if (days === 0) message = `Domain ${domain.domainName} expires TODAY. Immediate renewal required.`;
          if (days < 0) message = `Domain ${domain.domainName} EXPIRED ${Math.abs(days)} days ago!`;

          if (domain.responsibleEmployee) {
            await createNotification({
              userId: domain.responsibleEmployee._id,
              companyId: domain.companyId,
              title: 'Domain Renewal Reminder',
              message,
              type: 'Alert',
              link: `/domains?search=${domain.domainName}`
            });
          }

          // Optional: also notify admins/super admins if priority is high. 
          // Assuming we log an audit for the system checking expiries and sending notifications.
          await logAudit({
            userId: null, // System
            action: 'DOMAIN_EXPIRY_REMINDER_SENT',
            module: 'Domain',
            recordId: domain._id,
            newValues: { daysRemaining: days, priority }
          });
        }
      }
    } catch (error) {
      console.error('[CRON] Error during daily domain check:', error.message);
    }
  });

  console.log('[CRON] Domain Expiry Scheduler initialized.');
};
