// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

const BROWSER_POOL_SIZE = 3;  // Define the pool size (adjust based on your load)
let browserPool = [];

// Middleware to handle raw binary data for the HTML content
app.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }));

// Initialize the browser pool
async function initializeBrowserPool() {
  for (let i = 0; i < BROWSER_POOL_SIZE; i++) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    browserPool.push(browser);
  }
}

// Get a browser instance from the pool
function getBrowserFromPool() {
  if (browserPool.length > 0) {
    return browserPool.pop(); // Pop a browser from the pool
  } else {
    console.log('No browsers available in pool, launching a new one...');
    return puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  }
}

// Return the browser instance to the pool
function returnBrowserToPool(browser) {
  if (browserPool.length < BROWSER_POOL_SIZE) {
    browserPool.push(browser);  // Push the browser back into the pool
  } else {
    console.log('Pool is full, closing browser...');
    browser.close();  // If the pool is full, close the browser
  }
}

// Endpoint to generate PDFs
app.post('/generate-pdf', async (req, res) => {
  const start = Date.now(); // For performance tracking
  let page = null;
  let browser = null;

  try {
    // Get a browser instance from the pool
    browser = await getBrowserFromPool();
    page = await browser.newPage(); // Create a new page for this request

    // Convert raw binary data to HTML content
    const htmlContent = req.body.toString('utf-8');

    // Set HTML content for Puppeteer to render
    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

    // Generate the PDF buffer
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    // Close the page but keep the browser instance for future requests
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
  } finally {
    // Return the browser back to the pool after request completion
    if (browser) {
      returnBrowserToPool(browser);
    }
  }
});

// Graceful shutdown to ensure browsers are properly closed
process.on('SIGINT', async () => {
  console.log('Shutting down, closing all browsers...');
  for (let browser of browserPool) {
    await browser.close();
  }
  process.exit();
});

// Initialize the browser pool at the start
initializeBrowserPool();

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
