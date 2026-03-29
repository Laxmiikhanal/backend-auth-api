import nodemailer from "nodemailer";

export async function sendResetEmail(to: string, resetUrl: string) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    throw new Error("EMAIL_USER / EMAIL_PASS missing in .env");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5;">
      <h2>Password Reset</h2>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <p style="margin: 20px 0;">
        <a href="${resetUrl}"
           style="background:#ec4899;color:white;padding:12px 18px;border-radius:10px;text-decoration:none;display:inline-block;">
          Reset Password
        </a>
      </p>
      <p>If you didn’t request this, you can ignore this email.</p>
    </div>
  `;

  await transporter.sendMail({
    from: user,
    to,
    subject: "Reset your password",
    html,
  });
}