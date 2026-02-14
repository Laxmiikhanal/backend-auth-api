import nodemailer from "nodemailer";

const EMAIL_USER = process.env.EMAIL_USER || "";
const EMAIL_PASS = process.env.EMAIL_PASS || "";

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn("EMAIL_USER/EMAIL_PASS missing. Check your .env loading.");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

// Verify once at startup (great for debugging)
transporter.verify((err) => {
  if (err) console.error("Nodemailer verify failed:", err);
  else console.log("Nodemailer transporter ready");
});

export async function sendEmail(to: string, subject: string, html: string) {
  const info = await transporter.sendMail({
    from: `Blossom <${EMAIL_USER}>`,
    to,
    subject,
    html,
  });

  console.log("Email sent:", info.messageId);
  return info;
}
