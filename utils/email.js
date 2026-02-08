const nodemailer = require('nodemailer');

// Helper: Convert any JSON object to a readable HTML table
function jsonToHtmlTable(obj) {
  if (!obj || typeof obj !== 'object') return '';
  return `<table style="width:100%; border-collapse:collapse; font-size:16px;">
    ${Object.entries(obj).map(([key, value]) => `
      <tr>
        <td style="padding:8px; font-weight:bold; background:#f2f2f2;">${toTitleCase(key)}</td>
        <td style="padding:8px;">${typeof value === 'object' && value !== null ? `<pre style='margin:0;'>${JSON.stringify(value, null, 2)}</pre>` : String(value)}</td>
      </tr>
    `).join('')}
  </table>`;
}

  function toTitleCase(str) {
    return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }


async function sendEmail(subject, body_text) {
  // Create a transporter using Yahoo's SMTP server details
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD  
    }
  });

  // Define the email details
  const mailOptions = {
    from   : process.env.EMAIL_USERNAME,  // sender address
    to     : process.env.EMAIL_RECEIPIENTS,        // list of recipients
    subject: subject,
    text   : body_text, // plain text body
    html   : (`<html>
                  <head>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        background-color: #f3f3f3;
                        padding: 20px;
                      }
                      .email-container {
                        background-color: #fff;
                        border-radius: 12px;
                        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                        padding: 30px;
                        max-width: 600px;
                        margin: auto;
                      }
                      .email-header {
                        text-align: center;
                        color: #fff;
                        background-color: #FF6F61; /* Tropical Coral */
                        padding: 1px;
                        border-radius: 16px;
                        font-size: 16px;
                      }
                      .email-body {
                        margin-top: 20px;
                        font-size: 16px;
                        color: #333;
                        line-height: 1.6;
                      }
                      .email-title {
                        text-align: center;
                        font-size: 22px;
                        font-weight: bold;
                        color: #2a9d8f; /* Tropical Green */
                        margin-bottom: 15px;
                      }
                      .footer {
                        margin-top: 20px;
                        text-align: center;
                        color: #aaa;
                        font-size: 14px;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="email-container">
                      <div class="email-header">
                        <h1>Sri Luxe Escapes</h1>
                      </div>
                      <div class="email-body">
                        <h2 class="email-title">${subject}</h2>
                        ${body_text}
                      </div>
                      <br/>
                      <br/>
                      <hr/>
                      <div class="footer">
                        <p>&copy; 2026 Sri Luxe Escapes. All rights reserved.</p>
                      </div>
                    </div>
                  </body>
            </html>`) // HTML body
  };

  // Send the email
  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: ' + info.response);
  } catch (error) {
    console.error('Error sending email: ' + error, process.env.EMAIL_USERNAME);
  }
}


module.exports = {
    sendEmail,
    jsonToHtmlTable
}
