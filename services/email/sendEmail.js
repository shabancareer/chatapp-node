import { main } from "./email.js";
const fixedMailOptions = {
  from: process.env.EMAIL_FROM,
};

export function sendEmail(options = {}) {
  const mailOptions = Object.assign({}, options, fixedMailOptions);
  return main(mailOptions);
}
