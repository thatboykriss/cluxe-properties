const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Allow frontend requests
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// 🔹 Contact / General Lead Form
app.post("/send-email", async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // change if using another mail service
      auth: {
        user: process.env.EMAIL_USER, // stored in Vercel env
        pass: process.env.EMAIL_PASS, // stored in Vercel env
      },
    });

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER, // goes to your email
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, error: "Failed to send email" });
  }
});

// 🔹 Ebook Download Form
app.post("/send-ebook", async (req, res) => {
  const { name, email, whatsapp } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email to you (lead capture)
    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: "New eBook Download Request",
      text: `Name: ${name}\nEmail: ${email}\nWhatsApp: ${whatsapp}`,
    });

    // Email to the user (auto-reply with ebook link)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Free Real Estate eBook 📘",
      text: `Hi ${name},\n\nThank you for downloading our free real estate eBook! 🎉\n\nClick the link below to download:\n${process.env.SITE_URL}/files/cluxe-free-ebook.pdf\n\nHappy reading!\n\nC. Luxe Properties`,
    });

    res.status(200).json({ success: true, message: "eBook sent successfully" });
  } catch (error) {
    console.error("Error sending eBook:", error);
    res.status(500).json({ success: false, error: "Failed to send eBook" });
  }
});

// Export for Vercel
module.exports = app;
