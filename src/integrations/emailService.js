export const sendEmail = async (to, subject, body) => {
  if (!process.env.SMTP_HOST) {
    console.log('[Mock Email] Email not configured. Skipping sending to:', to);
    return { success: false, message: 'Provider not configured' };
  }
  // Real Nodemailer logic goes here
  return { success: true };
};