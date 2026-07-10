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

function parseLineToRuns(lineText, isHeading = false, headingLevel = null) {
  const runs = [];
  let i = 0;
  let currentText = "";
  let isBold = isHeading ? true : false;
  let isCode = false;

  let defaultSize = 22;
  if (headingLevel === HeadingLevel.HEADING_1) defaultSize = 32;
  else if (headingLevel === HeadingLevel.HEADING_2) defaultSize = 28;
  else if (headingLevel === HeadingLevel.HEADING_3) defaultSize = 24;

  while (i < lineText.length) {
    if (lineText.startsWith('**', i)) {
      if (currentText) {
        runs.push(new TextRun({
          text: currentText,
          font: isCode ? "Courier New" : "Arial",
          bold: isBold,
          size: defaultSize,
          color: isHeading ? "000000" : (isCode ? "A52A2A" : "333333"),
        }));
        currentText = "";
      }
      isBold = isHeading ? true : !isBold;
      i += 2;
    } else if (lineText[i] === '`') {
      if (currentText) {
        runs.push(new TextRun({
          text: currentText,
          font: isCode ? "Courier New" : "Arial",
          bold: isBold,
          size: defaultSize,
          color: isHeading ? "000000" : (isCode ? "A52A2A" : "333333"),
        }));
        currentText = "";
      }
      isCode = !isCode;
      i += 1;
    } else {
      currentText += lineText[i];
      i += 1;
    }
  }

  if (currentText) {
    runs.push(new TextRun({
      text: currentText,
      font: isCode ? "Courier New" : "Arial",
      bold: isBold,
      size: defaultSize,
      color: isHeading ? "000000" : (isCode ? "A52A2A" : "333333"),
    }));
  }

  return runs;
}

function isTableRow(line) {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2;
}

function isTableSeparator(line) {
  const trimmed = line.trim();
  return isTableRow(line) && /^\|[\s\-\:\|]+$/.test(trimmed);
}

function processMarkdownText(text, docChildren) {
  const lines = text.split('\n');
  let lineIdx = 0;
  while (lineIdx < lines.length) {
    const line = lines[lineIdx];
    if (line.trim()) {
      // Parse markdown tables if detected
      if (isTableRow(line) && lineIdx + 1 < lines.length && isTableSeparator(lines[lineIdx + 1])) {
        const tableLines = [];
        while (lineIdx < lines.length && isTableRow(lines[lineIdx])) {
          tableLines.push(lines[lineIdx]);
          lineIdx++;
        }

        const rows = [];
        for (const tblLine of tableLines) {
          if (isTableSeparator(tblLine)) continue;
          
          const cells = tblLine.split('|')
            .map(c => c.trim())
            .slice(1, -1);

          rows.push(cells);
        }

        if (rows.length > 0) {
          const docxRows = rows.map((cells, rowIndex) => {
            const isHeader = rowIndex === 0;
            return new TableRow({
              children: cells.map(cellText => {
                return new TableCell({
                  shading: isHeader ? { fill: "EEEEEE" } : undefined,
                  margins: { top: 100, bottom: 100, left: 150, right: 150 },
                  borders: {
                    top: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
                    bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
                    left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
                    right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" },
                  },
                  children: [
                    new Paragraph({
                      children: parseLineToRuns(cellText, isHeader),
                      spacing: { after: 0 }
                    })
                  ]
                });
              })
            });
          });

          docChildren.push(new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: docxRows
          }));
          docChildren.push(new Paragraph({ text: "", spacing: { after: 120 } }));
        }
        continue;
      }

      let cleanLine = line.trim();
      let isBullet = false;
      let headingLevel = null;

      if (cleanLine.startsWith('* ')) {
        isBullet = true;
        cleanLine = cleanLine.substring(2);
      } else if (cleanLine.startsWith('- ')) {
        isBullet = true;
        cleanLine = cleanLine.substring(2);
      } else if (cleanLine.startsWith('### ')) {
        headingLevel = HeadingLevel.HEADING_3;
        cleanLine = cleanLine.substring(4);
      } else if (cleanLine.startsWith('## ')) {
        headingLevel = HeadingLevel.HEADING_2;
        cleanLine = cleanLine.substring(3);
      } else if (cleanLine.startsWith('# ')) {
        headingLevel = HeadingLevel.HEADING_1;
        cleanLine = cleanLine.substring(2);
      }

      const runs = parseLineToRuns(cleanLine, headingLevel !== null, headingLevel);
      const pOptions = {
        children: runs,
        spacing: { after: 120 }
      };

      if (isBullet) {
        pOptions.bullet = { level: 0 };
      } else if (headingLevel) {
        pOptions.heading = headingLevel;
        pOptions.spacing = { before: 240, after: 120 };
      }

      docChildren.push(new Paragraph(pOptions));
    }
    lineIdx++;
  }
}

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

    // 2. Body content paragraphs parsed from Markdown (with native Word Table & Inline Mermaid support)
    const content = section.content || "";
    const parts = content.split('```mermaid');
    
    // Process the first text chunk
    processMarkdownText(parts[0], docChildren);

    // Process subsequent inline Mermaid code chunks
    for (let k = 1; k < parts.length; k++) {
      const part = parts[k];
      const endIdx = part.indexOf('```');
      if (endIdx !== -1) {
        const mermaidCode = part.substring(0, endIdx).trim();
        const remainingText = part.substring(endIdx + 3);

        // Render this inline Mermaid diagram
        try {
          const imageBuffer = await fetchDiagramFromKroki(mermaidCode);
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
            spacing: { before: 120, after: 120 }
          }));
        } catch (err) {
          docChildren.push(new Paragraph({
            text: `[⚠️ Diagram Render Error: Kroki API Unavailable]`,
            spacing: { before: 120, after: 60 }
          }));
          docChildren.push(new Paragraph({
            text: mermaidCode,
            spacing: { after: 120 }
          }));
        }

        // Process the rest of the text in this part
        processMarkdownText(remainingText, docChildren);
      } else {
        // Fallback for missing closing tag
        processMarkdownText(part, docChildren);
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
