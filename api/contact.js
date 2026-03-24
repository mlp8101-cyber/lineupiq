'use strict';
const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { firstName, lastName, email, subject, message } = req.body;

    if (!firstName || !lastName || !email || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"LineupIQ Support" <${process.env.GMAIL_USER}>`,
      to: 'mlp8101@gmail.com',
      replyTo: `"${firstName} ${lastName}" <${email}>`,
      subject: `[LineupIQ Support] ${subject} — from ${firstName} ${lastName}`,
      text: [
        `Name: ${firstName} ${lastName}`,
        `Email: ${email}`,
        `Topic: ${subject}`,
        ``,
        `Message:`,
        message,
      ].join('\n'),
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9f9f9;border-radius:8px;overflow:hidden">
          <div style="background:#005EB8;padding:24px 32px">
            <h1 style="margin:0;color:#fff;font-size:22px;letter-spacing:0.04em">LineupIQ Support</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:14px">New message from the support form</p>
          </div>
          <div style="padding:32px;background:#fff">
            <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-size:13px;width:100px">Name</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#1a1a1a;font-size:14px;font-weight:500">${firstName} ${lastName}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #eee;color:#666;font-size:13px">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #eee;font-size:14px"><a href="mailto:${email}" style="color:#005EB8">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:#666;font-size:13px">Topic</td>
                <td style="padding:10px 0;color:#1a1a1a;font-size:14px;font-weight:500">${subject}</td>
              </tr>
            </table>
            <div style="background:#f5f5f5;border-radius:8px;padding:20px 24px;border-left:4px solid #005EB8">
              <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#666;text-transform:uppercase;letter-spacing:0.08em">Message</p>
              <p style="margin:0;font-size:15px;color:#1a1a1a;line-height:1.65;white-space:pre-wrap">${message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>
            </div>
          </div>
          <div style="padding:20px 32px;background:#f9f9f9;border-top:1px solid #eee;text-align:center">
            <p style="margin:0;font-size:12px;color:#999">Sent via LineupIQ Support Form &nbsp;·&nbsp; lineupiq.vercel.app/support</p>
          </div>
        </div>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact email error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
};
