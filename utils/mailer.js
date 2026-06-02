const nodemailer = require('nodemailer');

// Using ethereal or dummy transport for dev
// The user should set SMTP_USER and SMTP_PASS in .env
const transporter = nodemailer.createTransport({
  service: 'gmail', // or any other service you use
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendMail = async (to, subject, text, html) => {
  try {
    // If credentials aren't set, just log it and skip to avoid crashing
    if (!process.env.SMTP_USER) {
      console.log(`[Mock Mail] To: ${to}, Subject: ${subject}`);
      return;
    }

    await transporter.sendMail({
      from: `"ZeroWaste Alert" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Error sending email:', err);
  }
};

module.exports = { sendMail };
