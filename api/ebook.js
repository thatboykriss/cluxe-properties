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
    // Setup email transport (use the same Gmail/SMTP settings from contact.js)
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your business Gmail
        pass: process.env.EMAIL_PASS, // app password
      },
    });

    // Send email with lead details
    await transporter.sendMail({
      from: `"C. Luxe Properties" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO, // your inbox
      subject: "📘 New eBook Lead",
      text: `A visitor requested the eBook.\n\nName: ${name}\nEmail: ${email}\nWhatsApp: ${whatsapp}`,
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error sending eBook lead:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
}
