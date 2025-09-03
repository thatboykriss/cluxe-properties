// api/ebook.js
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { name, email, whatsapp } = req.body;

  if (!name || !email || !whatsapp) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 🔹 Setup Gmail SMTP with App Password
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    // 🔹 Send lead details to your inbox
    await transporter.sendMail({
      from: `"C. Luxe Properties" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // send to your own inbox
      subject: "📘 New eBook Lead",
      text: `A visitor requested the eBook:\n\nName: ${name}\nEmail: ${email}\nWhatsApp: ${whatsapp}`,
    });

    // ✅ Success
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error sending eBook lead:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
