// server.js
const express = require('express');
const pdfController = require('./controllers/pdfController');
const puppeteer = require('puppeteer');  // Add this line to import Puppeteer

const app = express();
const port = 3000;

const BROWSER_POOL_SIZE = 3;  // Define the pool size (adjust based on your load)
let browserPool = [];

// Middleware for parsing JSON and raw binary data
app.use(express.json());
app.use(express.raw({ type: 'application/octet-stream', limit: '10mb' }));

// Initialize the browser pool at server startup
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
    return browserPool.pop();  // Pop a browser from the pool
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

// Graceful shutdown to ensure browsers are properly closed
process.on('SIGINT', async () => {
  console.log('Shutting down, closing all browsers...');
  for (let browser of browserPool) {
    await browser.close();
  }
  process.exit();
});

// Initialize the browser pool at server startup
initializeBrowserPool();

// Routes
app.post('/generate-pdf', pdfController.generatePDF);
app.post('/generatePDFfromHTML', pdfController.generatePDFfromHTML);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
