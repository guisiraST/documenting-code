const fs = require('fs');
const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

async function generateTemplateIfMissing(filePath) {
  if (fs.existsSync(filePath)) {
    return;
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1800, // 1800 dxa = 1.25 inches
            bottom: 1800,
            left: 1800,
            right: 1800,
          }
        }
      },
      children: [
        new Paragraph({
          text: "document-code Ultimate Master Template",
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "This is a placeholder for the documenting-code base template. Append new content below.",
              font: "Arial",
              size: 24,
              color: "333333", // Dark gray
            }),
          ],
          spacing: { before: 200, after: 200 },
        }),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
}

if (require.main === module) {
  const path = require('path');
  generateTemplateIfMissing(path.join(__dirname, '../template.docx'))
    .then(() => {
      console.log('Predefined template.docx generated successfully.');
    })
    .catch((err) => {
      console.error('Error generating template:', err);
    });
}

module.exports = { generateTemplateIfMissing };
