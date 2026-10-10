import Notification from '../models/Notification.js';

export const createNotification = async ({
  userId,
  companyId = null,
  title,
  message,
  type = 'System',
  link = null
}) => {
  try {
    return await Notification.create({
      user: userId,
      companyId,
      title,
      message,
      type,
      link,
      isRead: false
    });
  } catch (err) {
    console.error('Create Notification Error:', err.message);
  }
};
