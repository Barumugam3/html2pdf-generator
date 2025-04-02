// templates/htmlTemplate.js

// Function to generate HTML content with dynamic data
exports.createPDFFromJsonInput = (title, content, imageUrl, footerText) => {
    // Log to ensure HTML is properly generated
    console.log('Generated HTML:', title);
    return `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
            }
            .header {
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .content {
              font-size: 16px;
              margin-bottom: 20px;
            }
            .footer {
              text-align: center;
              font-size: 12px;
              margin-top: 40px;
              color: gray;
            }
            img {
              max-width: 100%;
              height: auto;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">${title}</div>
          <div class="content">${content}</div>
          <img src="${imageUrl}" alt="Dynamic Image"/>
          <div class="footer">${footerText}</div>
        </body>
      </html>
    `;
  };
  