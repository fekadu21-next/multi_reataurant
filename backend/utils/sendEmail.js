import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const sendEmail = async (to, subject, text, html = null) => {
  try {

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS  // your Gmail app password
      }
    });
    const mailOptions = {
      from: process.env.EMAIL_USER, // sender
      to,                           // recipient
      subject,                      // subject line
      text                          // plain text body
    };
    if (html) {
      mailOptions.html = html;
    }
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent");
  }
};
export default sendEmail;