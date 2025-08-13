// Backend/utils/mailer.js
import nodemailer from "nodemailer";

const {
  SMTP_HOST = "smtp.gmail.com",
  SMTP_PORT = "465",
  SMTP_SECURE = "true",
  SMTP_USER,              // help.patelceramics@gmail.com
  SMTP_PASS,              // Gmail App Password (no spaces)
  SUPPORT_INBOX,          // optional, defaults to SMTP_USER
  BRAND_NAME = "Patel Ceramics Support",
} = process.env;

// Single transport reused app-wide
export const mailer = nodemailer.createTransport({
  host: SMTP_HOST,
  port: Number(SMTP_PORT),
  secure: String(SMTP_SECURE) === "true",
  auth: { user: SMTP_USER, pass: SMTP_PASS },
});

try {
  const ok = await mailer.verify();
  console.log("[MAIL] SMTP ready:", ok);
} catch (e) {
  console.error("[MAIL] SMTP verify FAILED:", e?.message || e);
}

/** Escape HTML */
function escapeHTML(s = "") {
  return String(s).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[m]));
}

/** Generic email helper */
export async function sendMail({
  from,
  to,
  cc,
  bcc,
  subject,
  text,
  html,
  replyTo,
  headers,
}) {
  if (!to || !subject) throw new Error('sendMail: "to" and "subject" are required');
  return mailer.sendMail({
    from: from || `"${BRAND_NAME}" <${SMTP_USER}>`,
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    replyTo,
    headers,
  });
}

/** Acknowledgement to the customer (they can reply to this). */
export async function sendTicketAckToCustomer({
  ticketId,
  issue,
  toEmail,
  customerName,
  orderId,
}) {
  const subject = `[${ticketId}] We received your support request`;
  const safeIssue = escapeHTML(issue || "");
  const html = `
    <p>Hi ${escapeHTML(customerName || "there")},</p>
    <p>Thanks for contacting <b>${BRAND_NAME}</b>. Your ticket has been created.</p>
    <p>
      <b>Ticket ID:</b> ${escapeHTML(ticketId)}<br/>
      ${orderId ? `<b>Order Number:</b> ${escapeHTML(orderId)}<br/>` : ""}
      ${safeIssue ? `<b>Issue:</b> ${safeIssue}` : ""}
    </p>
    <p>You can reply to this email to add more details.</p>
    <p>— ${BRAND_NAME}</p>
  `;
  const text =
`Hi ${customerName || "there"},

Thanks for contacting ${BRAND_NAME}. Your ticket has been created.

Ticket ID: ${ticketId}
${orderId ? `Order Number: ${orderId}\n` : ""}${issue ? `Issue: ${issue}\n\n` : "\n"}You can reply to this email to add more details.

— ${BRAND_NAME}`;

  await sendMail({
    to: toEmail,
    subject,
    text,
    html,
    headers: { "X-Ticket-ID": ticketId },
  });
}

/** Ping the support inbox so the NEW ticket shows in Inbox immediately. */
export async function notifySupportNewTicket({
  ticketId,
  issue,
  customerEmail,
  customerName,
  orderId,
}) {
  const to = SUPPORT_INBOX || SMTP_USER;
  const subject = `[New Ticket] [${ticketId}] from ${customerName || customerEmail || "Customer"}`;
  const html = `
    <p><b>New ticket created</b></p>
    <p>
      <b>Ticket ID:</b> ${escapeHTML(ticketId)}<br/>
      <b>From:</b> ${escapeHTML(customerName || "")} &lt;${escapeHTML(customerEmail || "")}&gt;<br/>
      ${orderId ? `<b>Order Number:</b> ${escapeHTML(orderId)}<br/>` : ""}
      <b>Issue:</b> ${escapeHTML(issue || "")}
    </p>
    <p>Tip: hit <i>Reply</i> to email the customer (Reply-To is set).</p>
  `;
  const text =
`New ticket created

Ticket ID: ${ticketId}
From: ${customerName || ""} <${customerEmail || ""}>
${orderId ? `Order Number: ${orderId}\n` : ""}Issue: ${issue || ""}

Tip: Reply in Gmail to contact the customer.`;

  await sendMail({
    to,
    subject,
    text,
    html,
    replyTo: customerEmail || undefined,
    headers: { "X-Ticket-ID": ticketId },
  });
}
