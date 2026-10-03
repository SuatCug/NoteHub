const nodemailer = require('nodemailer');

// SMTP ayarları yoksa (geliştirme ortamı) e-posta gönderilmez, içerik konsola yazılır.
const transporter = process.env.SMTP_HOST
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: parseInt(process.env.SMTP_PORT, 10) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  : null;

const getClientUrl = () => (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();

const sendVerificationEmail = async (user, token) => {
  const link = `${getClientUrl()}/verify-email?token=${token}`;

  if (!transporter) {
    console.log(`📧 [DEV] Verification link for ${user.email}: ${link}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.MAIL_FROM || 'SearchNote <no-reply@searchnote.app>',
    to: user.email,
    subject: 'SearchNote - Verify your email address',
    text: `Hi ${user.fullName},\n\nClick the link below to verify your SearchNote account:\n${link}\n\nThe link is valid for 24 hours.`,
    html: `<p>Hi ${user.fullName},</p>
      <p>Click the link below to verify your SearchNote account:</p>
      <p><a href="${link}">Verify my email address</a></p>
      <p>The link is valid for 24 hours.</p>`,
  });
};

module.exports = { sendVerificationEmail };
