const nodemailer = require('nodemailer');

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
    from   : process.env.EMAIL_USERNAME, // sender address
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
                        border-radius: 10px;
                        font-size: 20px;
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
                        <h1>SRILUXESCAPE API</h1>
                      </div>
                      <div class="email-body">
                        <h2 class="email-title">${subject}</h2>
                        <p>${body_text}</p>
                      </div>
                      <br/>
                      <br/>
                      <hr/>
                      <div class="footer">
                        <p>&copy; 2025 SRILUXESCAPE API. All rights reserved.</p>
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
    sendEmail
}
