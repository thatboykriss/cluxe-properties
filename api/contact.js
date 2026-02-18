import nodemailer from "nodemailer";

// Helper: parse form body for urlencoded/text/plain or JSON
async function parseBody(req) {
  const contentType = req.headers["content-type"] || "";
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString();

  if (contentType.includes("application/json")) {
    try { return JSON.parse(raw); } catch { return {}; }
  }
  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("text/plain")
  ) {
    const params = new URLSearchParams(raw);
    return Object.fromEntries(params.entries());
  }
  return {};
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const body = await parseBody(req);
  const name = body.name || body.Name;
  const email = body.email || body.Email;
  const message = body.message || body.Message;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  // 🔒 SPAM PROTECTION BLOCK

// Block suspicious domains
const blockedDomains = ["mail.ru", "maiilscores.com", ".ru"];
if (blockedDomains.some(domain => email.toLowerCase().includes(domain))) {
  return res.status(400).json({ success: false, message: "Spam detected" });
}

// Block weird numeric patterns in email (e.g., 2.8.5.6.998.@gmail.com)
const weirdPattern = /\d+\.\d+\.\d+/;
if (weirdPattern.test(email)) {
  return res.status(400).json({ success: false, message: "Spam detected" });
}

// Block Cyrillic characters (Russian spam)
const containsCyrillic = /[а-яА-ЯЁё]/;
if (containsCyrillic.test(message)) {
  return res.status(400).json({ success: false, message: "Spam detected" });
}

// Block links in message
if (message.includes("http") || message.includes("www")) {
  return res.status(400).json({ success: false, message: "Links not allowed" });
}

// Minimum message length
if (message.length < 10) {
  return res.status(400).json({ success: false, message: "Message too short" });
}


  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    await transporter.sendMail({
      from: `"C. Luxe Properties" <${process.env.EMAIL_USER}>`,
      to: "cluxeproperties@gmail.com",
      subject: "New Contact Form Submission",
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      html: `<p><b>Name:</b> ${name}</p>
             <p><b>Email:</b> ${email}</p>
             <p><b>Message:</b><br/>${message}</p>`,
    });

    // ✅ Redirect to thank-you page
    res.setHeader("Location", "/thank-you.html");
    return res.status(303).end();

  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({ success: false, message: "Server error, email not sent." });
  }
}
