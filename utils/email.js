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

// Helper: Recursively render any JSON object or array as HTML tables
function deepJsonToHtmlTable(data) {
  if (Array.isArray(data)) {
    // Render array as a table with index and value
    return `<table style="width:100%; border-collapse:collapse; font-size:16px;">
      <tr><th style="padding:8px; background:#e0e0e0;">Index</th><th style="padding:8px; background:#e0e0e0;">Value</th></tr>
      ${data.map((item, idx) => `
        <tr>
          <td style="padding:8px; font-weight:bold;">${idx}</td>
          <td style="padding:8px;">${typeof item === 'object' && item !== null ? deepJsonToHtmlTable(item) : String(item)}</td>
        </tr>
      `).join('')}
    </table>`;
  } else if (typeof data === 'object' && data !== null) {
    // Render object as a table
    return `<table style="width:100%; border-collapse:collapse; font-size:16px;">
      ${Object.entries(data).map(([key, value]) => `
        <tr>
          <td style="padding:8px; font-weight:bold; background:#f2f2f2;">${toTitleCase(key)}</td>
          <td style="padding:8px;">${typeof value === 'object' && value !== null ? deepJsonToHtmlTable(value) : String(value)}</td>
        </tr>
      `).join('')}
    </table>`;
  } else {
    // Primitive value
    return String(data);
  }
}


// Specialized function to render custom tour JSON as rich HTML
function renderCustomTourHtml(data) {

  if (!data || typeof data !== 'object') return '';
  const req = data.custom_tour_request || {};
  const tour = data.generated_custom_tour || {};
  const itinerary = Array.isArray(tour.itenerary) ? tour.itenerary : [];
  const backendUrl = process.env.BACKEND_URL || '';

  return `
    <div style="font-family:Arial,sans-serif;max-width:800px;margin:auto;background:#fff;border-radius:12px;box-shadow:0 4px 10px rgba(0,0,0,0.08);padding:30px;">
      <h2 style="color:#2a9d8f;text-align:center;margin-bottom:24px;">${tour.title || 'Custom Tour'}</h2>
      <img src="${tour.banner || ''}" alt="Tour Banner" style="width:100%;max-height:240px;object-fit:cover;border-radius:8px;margin-bottom:24px;" />
      <p style="font-size:18px;color:#333;text-align:center;margin-bottom:24px;">${tour.description || ''}</p>
      <hr style="margin:24px 0;" />
      <h3 style="color:#FF6F61;">Customer Details</h3>
      ${jsonToHtmlTable(req)}
      <hr style="margin:24px 0;" />
      <h3 style="color:#FF6F61;">Tour Details</h3>
      <table style="width:100%;border-collapse:collapse;font-size:16px;margin-bottom:24px;">
        <tr><td style="padding:8px;font-weight:bold;background:#f2f2f2;">Number of Days</td><td style="padding:8px;">${tour.num_of_days || ''}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;background:#f2f2f2;">Price</td><td style="padding:8px;">${tour.price || ''}</td></tr>
      </table>
      <h3 style="color:#FF6F61;">Itinerary</h3>
      <div>
        ${itinerary.map(day => `
          <div style="margin-bottom:32px;border:1px solid #e0e0e0;border-radius:8px;padding:16px;background:#fafafa;">
            <h4 style="color:#2a9d8f;margin-bottom:8px;">Day ${day.day}: ${day.destination}</h4>
            <table style="width:100%;border-collapse:collapse;font-size:15px;">
              <tr><td style="padding:6px;font-weight:bold;background:#f2f2f2;">City</td><td style="padding:6px;">${day.city}</td></tr>
              <tr><td style="padding:6px;font-weight:bold;background:#f2f2f2;">Activity</td><td style="padding:6px;">${day.activity}</td></tr>
              <tr><td style="padding:6px;font-weight:bold;background:#f2f2f2;">Stay</td><td style="padding:6px;">${day.stay}</td></tr>
              <tr><td style="padding:6px;font-weight:bold;background:#f2f2f2;">Hotel</td><td style="padding:6px;">${day.hotel}</td></tr>
              <tr><td style="padding:6px;font-weight:bold;background:#f2f2f2;">Latitude</td><td style="padding:6px;">${day.latitude}</td></tr>
              <tr><td style="padding:6px;font-weight:bold;background:#f2f2f2;">Longitude</td><td style="padding:6px;">${day.longitude}</td></tr>
            </table>
            <div style="margin-top:12px;">
              <strong>Images:</strong><br/>
              ${Array.isArray(day.images) && day.images.length > 0 ? day.images.map(img => `<img src="${img.startsWith('http') ? img : backendUrl + img}" alt="Day ${day.day} Image" style="width:120px;height:80px;object-fit:cover;border-radius:6px;margin:4px;" />`).join('') : '<em>No images</em>'}
            </div>
          </div>
        `).join('')}
      </div>
      <hr style="margin:24px 0;" />
      <div style="text-align:center;color:#aaa;font-size:14px;">Generated on ${tour.timestamp || ''}</div>
    </div>
  `;
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
    jsonToHtmlTable,
    deepJsonToHtmlTable
  ,
  renderCustomTourHtml
}
