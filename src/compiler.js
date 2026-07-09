const fs = require('fs');
const { 
  patchDocument, 
  PatchType, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  ImageRun, 
  Table, 
  TableRow, 
  TableCell, 
  BorderStyle, 
  WidthType 
} = require('docx');
const { fetchDiagramFromKroki } = require('./kroki');

async function compilePayloadToDocx(payload, templatePath, outputPath) {
  const docChildren = [
    new Paragraph({
      text: payload.document_title || "Codebase Documentation",
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 240, after: 120 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Target Path: ${payload.target_path} | Target Audience: ${payload.target_audience} | Style: ${payload.writing_style || 'corporate'}`,
          font: "Arial",
          size: 18,
          color: "666666",
        })
      ],
      spacing: { after: 240 }
    })
  ];

  for (const section of payload.sections) {
    // 1. Heading 2 for Section Title
    docChildren.push(new Paragraph({
      text: section.title,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 }
    }));

    // 2. Body content paragraphs
    const lines = section.content.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        docChildren.push(new Paragraph({
          children: [
            new TextRun({
              text: line,
              font: "Arial",
              size: 22,
              color: "333333"
            })
          ],
          spacing: { after: 120 }
        }));
      }
    }

    // 3. Diagrams embedding (with fallback)
    if (section.diagrams && section.diagrams.length > 0) {
      for (const diag of section.diagrams) {
        try {
          const imageBuffer = await fetchDiagramFromKroki(diag.mermaid_code);
          docChildren.push(new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 450,
                  height: 250,
                },
              }),
            ],
            spacing: { before: 120, after: 60 }
          }));
          docChildren.push(new Paragraph({
            children: [
              new TextRun({
                text: `Diagram: ${diag.caption}`,
                font: "Arial",
                size: 18,
                italic: true,
                color: "555555"
              })
            ],
            spacing: { after: 120 }
          }));
        } catch (err) {
          docChildren.push(new Paragraph({
            children: [
              new TextRun({
                text: `[⚠️ Diagram Render Error: Kroki API Unavailable - ${err.message}]`,
                bold: true,
                color: "FF0000",
                font: "Arial",
              })
            ],
            spacing: { before: 100, after: 100 }
          }));
        }
      }
    }

    // 4. Highlighted screenshot tags formatted as single-cell tables
    if (section.screenshot_tags && section.screenshot_tags.length > 0) {
      for (const tag of section.screenshot_tags) {
        docChildren.push(new Table({
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "auto" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
            right: { style: BorderStyle.NONE, size: 0, color: "auto" },
            left: { style: BorderStyle.SINGLE, size: 36, color: "FF0000" }, // 4.5pt thick red left border
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { fill: "F9F2F2" }, // Light pinkish-gray background
                  margins: { top: 120, bottom: 120, left: 180, right: 180 },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: `[📸 DEV SCREENSHOT REQUIRED: ${tag.instruction} in ${tag.target_file}:${tag.line_number}]`,
                          bold: true,
                          color: "FF0000",
                          font: "Arial",
                          size: 20,
                        })
                      ],
                    })
                  ]
                })
              ]
            })
          ]
        }));
        docChildren.push(new Paragraph({ text: "", spacing: { after: 100 } })); // small spacing
      }
    }
  }

  // 5. Read template document buffer
  const templateBuffer = fs.readFileSync(templatePath);

  // 6. Patch the {{content}} placeholder with compiled docChildren
  const buffer = await patchDocument(templateBuffer, {
    outputType: "nodebuffer",
    patches: {
      content: {
        type: PatchType.DOCUMENT,
        children: docChildren,
      }
    }
  });

  // 7. Write the patched file to the output path
  fs.writeFileSync(outputPath, buffer);
}

module.exports = { compilePayloadToDocx };
