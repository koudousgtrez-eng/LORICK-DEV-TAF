import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  if (process.env.NODE_ENV === 'test') return; // ← désactive en mode test
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@ecomarket.fr',
    to,
    subject,
    html,
  });
};