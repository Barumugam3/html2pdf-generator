// services/pdfService.js
const puppeteerHelper = require('../utils/puppeteerHelper');
const htmlTemplate = require('../templates/htmlTemplate');

// Service method to create PDF from request data
exports.createPDFFromJson = async ({ title, content, imageUrl, footerText }) => {

    // Log to ensure HTML is properly generated
    console.log(' HTML:', title, content, imageUrl, footerText);

  // Generate dynamic HTML content based on the input parameters
  const htmlContent = htmlTemplate.createPDFFromJsonInput(title, content, imageUrl, footerText);

  // Log to ensure HTML is properly generated
  console.log('Generated HTML:', htmlContent);

  // Use Puppeteer to create the PDF
  const pdfBuffer = await puppeteerHelper.generatePDF(htmlContent);

  return pdfBuffer;
};

// Service method to create PDF from HTML content
exports.createPDF = async (htmlContent) => {
    // Use Puppeteer helper to generate the PDF
    const pdfBuffer = await puppeteerHelper.generatePDF(htmlContent);
    return pdfBuffer;
  };
