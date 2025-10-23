// lib/sendEmail.js
import nodemailer from 'nodemailer';

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
} = process.env;

export async function sendEmail({ to, subject, html }) {
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP not configured; skipping email send.');
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: 'Manyagi Realty <realty@manyagi.net>',
    to,
    subject,
    html,
  });

  return { messageId: info.messageId };
}