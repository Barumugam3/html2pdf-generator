// utils/puppeteerHelper.js
const puppeteer = require('puppeteer');

let browserPool = [];

// Function to launch and reuse the Puppeteer browser instance
async function getBrowserInstance() {
  if (browserPool.length > 0) {
    return browserPool.pop();  // Pop a browser from the pool
  }
  
  console.log('Launching new browser instance...');
  return puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

// Function to generate PDF from HTML content
exports.generatePDF = async (htmlContent) => {
  const browser = await getBrowserInstance();
  const page = await browser.newPage();

  // Set the HTML content for the page
  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

  // Generate the PDF
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

  // Return the browser to the pool for reuse
  await page.close();
  browserPool.push(browser);  // Reusing browser

  return pdfBuffer;
};
