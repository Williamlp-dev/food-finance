import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailValues = {
  to: string;
  subject: string;
  text: string;
};

export async function sendEmail({ to, subject, text }: SendEmailValues) {
  await resend.emails.send({
    from: "verification@codinginflow-sample.com",
    to,
    subject,
    text,
  });
}
