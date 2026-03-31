import nodemailer from "nodemailer";
export const contact = async (req, res) => {
  try {
    const { fullName, email, phone, subject, question } = req.body;
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "fekaduasafew57@gmail.com",
        pass: "zdwxunbxqjyrcbud",
      },
    });
    const mailOptions = {
      from: "fekaduasafew57@gmail.com",
      to: "fekaduasafew57@gmail.com",
      replyTo: email,
      subject: subject
        ? `Customer Question: ${subject}`
        : `Customer Question from ${fullName}`,
      html: `
        <h2>users contact page </h2>
        <p><b>Full Name:</b> ${fullName}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Phone:</b> ${phone || "Not provided"}</p>
        <p><b>Subject:</b> ${subject || "No subject"}</p>
        <p><b>Question:</b></p>
        <p>${question}</p>
      `,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Email failed" });
  }
};