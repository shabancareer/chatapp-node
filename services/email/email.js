import nodemailer from "nodemailer";

const EMAIL = {
  authUser: process.env.AUTH_EMAIL_USERNAME,
  authPass: process.env.AUTH_EMAIL_PASSWORD,
};

export async function main(mailOptions) {
  // Create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: EMAIL.authUser,
      pass: EMAIL.authPass,
    },
  });
  const info = await transporter.sendMail({
    from: mailOptions?.from,
    to: mailOptions?.to,
    subject: mailOptions?.subject,
    text: mailOptions?.text,
    html: mailOptions?.html,
  });

  return info;
}
