import nodemailer from "nodemailer";

export function makeTransport() {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_SECURE,
    SMTP_USER,
    SMTP_PASS,
  } = process.env;

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 465),
    secure: String(SMTP_SECURE).toLowerCase() === "true", // true -> 465
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export async function sendMail({ to, subject, html, text }) {
  const fromName = process.env.MAIL_FROM_NAME || "Support";
  const fromAddr = process.env.MAIL_FROM_ADDRESS || process.env.SMTP_USER;

  const transporter = makeTransport();
  const info = await transporter.sendMail({
    from: `"${fromName}" <${fromAddr}>`,
    to,
    subject,
    text: text || "",
    html: html || "",
  });
  return info;
}
