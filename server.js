// server.js
const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = 3000;

// Middleware to handle raw binary data for the HTML content
app.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }));

app.post('/generate-pdf', async (req, res) => {
  try {
    // Launch puppeteer browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Convert binary data to HTML text
    const htmlContent = req.body.toString('utf-8');

    // Set the HTML content on the Puppeteer page
    await page.setContent(htmlContent);

    // Generate the PDF
    const pdfBuffer = await page.pdf({ format: 'A4' });

    // Close the browser
    await browser.close();

    // Set headers to indicate a PDF response and send the binary PDF data
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
