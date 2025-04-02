// controllers/pdfController.js
const pdfService = require('../services/pdfService');

// Controller method to handle PDF generation
exports.generatePDF = async (req, res) => {
  console.log('Request body:', req.body);  // Log the entire request body for debugging

  const { title, content, imageUrl, footerText } = req.body;

  try {
    // Log to ensure HTML is properly generated
    console.log(' Controller HTML:', title, content, imageUrl, footerText);

    // Call the service layer to generate the PDF
    const pdfBuffer = await pdfService.createPDFFromJson({ title, content, imageUrl, footerText });

    // Send the PDF as the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error in pdfController:', error);
    res.status(500).send('Error generating PDF');
  }
};

// Controller method for generating PDF from raw HTML (used by /generatePDFfromHTML)
exports.generatePDFfromHTML = async (req, res) => {
    const htmlContent = req.body.toString('utf-8'); // Read HTML as string from the raw binary data
  
    try {
      // Call the service layer to generate the PDF
      const pdfBuffer = await pdfService.createPDF(htmlContent);
  
      // Send the generated PDF as a response
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="generated.pdf"');
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error in pdfController (from HTML):', error);
      res.status(500).send('Error generating PDF');
    }
  };
