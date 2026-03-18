import nodemailer from "nodemailer";
export const sendQuestion = async (req, res) => {
  try {
    const { name, email, question } = req.body;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "fekaduasafew57@gmail.com",
        pass: "zdwxunbxqjyrcbud",
      },
    });
    const mailOptions = {
      from: "fekaduasafew57@gmail.com",
      to: "fekaduasafew57@gmail.com", // admin receives
      replyTo: email, // admin can reply directly to customer
      subject: `Customer Question from ${name}`,
      html: `
        <h2>Customer Inquiry</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
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