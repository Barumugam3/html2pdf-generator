// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

// In-memory pool to keep one browser instance alive
let browserInstance = null;

// Middleware to handle raw binary data for the HTML content
app.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }));

// Function to launch the browser once and reuse it
async function getBrowserInstance() {
  if (!browserInstance) {
    // Launching Puppeteer once and reusing the instance
    browserInstance = await puppeteer.launch({
      headless: true, // headless mode for server-side environments
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // for production environments (Docker, etc.)
    });
  }
  return browserInstance;
}

// Endpoint to generate PDFs
app.post('/generate-pdf', async (req, res) => {
  const start = Date.now(); // For performance tracking
  try {
    const browser = await getBrowserInstance(); // Reuse existing browser instance
    const page = await browser.newPage();

    // Convert raw binary data to HTML content
    const htmlContent = req.body.toString('utf-8');

    // Set HTML content for Puppeteer to render
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' }); // Ensure the DOM is fully loaded

    // Generate the PDF buffer
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    // Close the page but leave the browser open for reuse
    await page.close();

    // Set response headers to indicate it's a PDF file
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');
    res.send(pdfBuffer);

    // Performance tracking
    console.log(`PDF generated in ${Date.now() - start}ms`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).send('Error generating PDF');
  }
});

// Graceful shutdown to ensure browser process is properly closed
process.on('SIGINT', async () => {
  if (browserInstance) {
    await browserInstance.close();
    console.log('Browser instance closed on shutdown');
  }
  process.exit();
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
