import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

const initTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      console.log(`📧 Mock Email Transporter Initialized. Ethereal User: ${testAccount.user}`);
    } catch (err) {
      console.log('⚠️ Could not create Ethereal test account. Falling back to log-only email dispatch.');
      transporter = null;
    }
  }
  return transporter;
};

export const sendNotificationEmail = async (toEmail: string, title: string, message: string) => {
  console.log(`📬 [Mock Email Dispatch] To: ${toEmail} | Title: "${title}" | Message: "${message}"`);
  try {
    const t = await initTransporter();
    if (t) {
      const info = await t.sendMail({
        from: '"Enterprise WFM Alert" <no-reply@company.com>',
        to: toEmail,
        subject: title,
        text: message,
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #1e293b; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #6366f1; margin-top: 0; font-weight: 800; border-bottom: 2px solid #6366f1; padding-bottom: 8px;">Enterprise WFM Alert</h2>
            <h3 style="color: #0f172a; margin-top: 20px;">${title}</h3>
            <p style="line-height: 1.6; color: #334155;">${message}</p>
            <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;">
            <p style="font-size: 11px; color: #64748b; text-align: center;">This is a system generated notification. Please do not reply directly to this mail.</p>
          </div>
        `,
      });

      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`🔗 Ethereal Mock Email Preview Link: ${previewUrl}`);
      }
      return true;
    }
  } catch (err) {
    console.error('❌ Failed to dispatch notification email:', err);
  }
  return false;
};
export default sendNotificationEmail;
