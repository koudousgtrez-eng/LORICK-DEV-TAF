import nodemailer from 'nodemailer';

export const sendEmail = async ({ to, subject, html }: { to: string; subject: string; html: string }) => {
  if (process.env.NODE_ENV !== 'production' || !process.env.SMTP_USER || process.env.SMTP_USER.includes('remplir')) {
    console.log(`[DEV] Email simulé → ${to} | ${subject}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
  await transporter.sendMail({ from: 'EcoMarket <noreply@ecomarket.fr>', to, subject, html });
};
