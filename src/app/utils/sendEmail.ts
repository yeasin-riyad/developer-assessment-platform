import config from "../config/index.js";
import { transporter } from "../lib/nodemailer.js";

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
};

export const sendEmail = async ({
  to,
  subject,
  html,
}: SendEmailParams) => {
  await transporter.sendMail({
    from: `"Developer Assessment Platform" <${config.smtp_user}>`,
    to,
    subject,
    html,
  });
};