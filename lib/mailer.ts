import nodemailer from 'nodemailer';

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });
};

export const sendMail = async (params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) => {
  const transporter = getTransporter();
  const from = process.env.MAIL_FROM;

  if (!transporter || !from) {
    console.error('[mailer] SMTP not configured — mail not sent to', params.to);
    return { ok: false as const, error: 'SMTP not configured' };
  }

  try {
    await transporter.sendMail({
      from,
      to: params.to,
      subject: params.subject,
      text: params.text,
      html: params.html
    });
    return { ok: true as const };
  } catch (err) {
    console.error('[mailer] Failed to send mail to', params.to, ':', err);
    return { ok: false as const, error: err instanceof Error ? err.message : String(err) };
  }
};
