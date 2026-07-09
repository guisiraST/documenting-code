# document-code Code Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the document-code Node.js compiler application which converts a structured JSON payload of codebase analysis and Mermaid diagrams into a professionally styled Microsoft Word (.docx) file.

**Architecture:** The CLI application parses arguments, generates/opens a pre-styled `template.docx` base, fetches PNG diagrams from the cloud-rendered Kroki API using Mermaid.js syntax, inserts screenshot tag alerts, compiles all text/tables into the document, and generates an `execution-summary.md` audit file.

**Tech Stack:** Node.js, `docx` package (v8+), `axios` (v1+), `prompts` (v2+), `node:test` (built-in testing framework), and `node:assert`.

---

## File Structure Map
* `package.json` - Node dependencies and test commands.
* `src/index.js` - Command-line interface and orchestrator coordinator.
* `src/setup.js` - Utility to generate a template.docx if missing.
* `src/compiler.js` - Parser to assemble JSON content into Word document elements.
* `src/kroki.js` - Module to post Mermaid code to Kroki API and fetch diagram PNG bytes.
* `test/sample-payload.json` - Stub JSON data used for integration verification.

---

### Task 1: Initialize Project & Setup Testing
**Files:**
* Create: `package.json`
* Create: `test/compiler.test.js`

- [ ] **Step 1: Write a simple failing test to verify the test framework**
  Create `test/compiler.test.js` containing:
  ```javascript
  const test = require('node:test');
  const assert = require('node:assert');

  test('Sanity check', () => {
    assert.strictEqual(1, 2);
  });
  ```
- [ ] **Step 2: Run test and verify it fails**
  Run: `node --test test/compiler.test.js`
  Expected Output: `FAIL: Sanity check` (exit code 1)
- [ ] **Step 3: Fix test assertion to pass**
  Update `test/compiler.test.js`:
  ```javascript
  const test = require('node:test');
  const assert = require('node:assert');

  test('Sanity check', () => {
    assert.strictEqual(1, 1);
  });
  ```
- [ ] **Step 4: Run test to verify it passes**
  Run: `node --test test/compiler.test.js`
  Expected Output: `PASS`
- [ ] **Step 5: Write initial `package.json`**
  Create `package.json` containing:
  ```json
  {
    "name": "documenting-code",
    "version": "1.0.0",
    "description": "document-code Word Document Compiler Skill",
    "main": "src/index.js",
    "scripts": {
      "test": "node --test",
      "setup": "node src/setup.js"
    },
    "dependencies": {
      "axios": "^1.7.2",
      "docx": "^8.5.0",
      "prompts": "^2.4.2"
    }
  }
  ```
- [ ] **Step 6: Install dependencies and commit**
  Run: `npm install`
  Run:
  ```bash
  git add package.json package-lock.json test/compiler.test.js
  git commit -m "chore: initialize package.json and test harness"
  ```

---

### Task 2: Create Template Generator (`src/setup.js`)
**Files:**
* Create: `src/setup.js`
* Test: `test/setup.test.js`

- [ ] **Step 1: Write tests for template file checking**
  Create `test/setup.test.js` containing:
  ```javascript
  const test = require('node:test');
  const assert = require('node:assert');
  const fs = require('fs');
  const path = require('path');
  const { generateTemplateIfMissing } = require('../src/setup');

  test('Generate template file', () => {
    const tempPath = path.join(__dirname, 'temp_template.docx');
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

    generateTemplateIfMissing(tempPath);
    assert.ok(fs.existsSync(tempPath), 'template.docx was created');

    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  });
  ```
- [ ] **Step 2: Run test and verify it fails**
  Run: `node --test test/setup.test.js`
  Expected Output: Module not found or function not defined errors.
- [ ] **Step 3: Implement `generateTemplateIfMissing` in `src/setup.js`**
  Create `src/setup.js` containing:
  ```javascript
  const fs = require('fs');
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');

  function generateTemplateIfMissing(filePath) {
    if (fs.existsSync(filePath)) {
      return;
    }
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1800, // wide margin (~1.25 inches)
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
                color: "333333",
              }),
            ],
          }),
        ],
      }],
    });

    Packer.toBuffer(doc).then((buffer) => {
      fs.writeFileSync(filePath, buffer);
    });
  }

  module.exports = { generateTemplateIfMissing };
  ```
- [ ] **Step 4: Run test to verify it passes**
  Run: `node --test test/setup.test.js`
  Expected Output: `PASS`
- [ ] **Step 5: Run setup command to generate default `template.docx`**
  Modify `src/setup.js` to execute generation if run directly:
  ```javascript
  // Append to src/setup.js
  if (require.main === module) {
    const path = require('path');
    generateTemplateIfMissing(path.join(__dirname, '../template.docx'));
    console.log('Predefined template.docx generated successfully.');
  }
  ```
  Run: `npm run setup`
- [ ] **Step 6: Commit**
  Run:
  ```bash
  git add src/setup.js test/setup.test.js template.docx
  git commit -m "feat: implement template.docx auto-generation setup"
  ```

---

### Task 3: Kroki API Diagram Fetcher (`src/kroki.js`)
**Files:**
* Create: `src/kroki.js`
* Test: `test/kroki.test.js`

- [ ] **Step 1: Write test for Kroki API renderer**
  Create `test/kroki.test.js` containing:
  ```javascript
  const test = require('node:test');
  const assert = require('node:assert');
  const { fetchDiagramFromKroki } = require('../src/kroki');

  test('Fetch Mermaid png diagram from Kroki', async () => {
    const mermaidCode = 'graph TD\nA --> B';
    const imageBuffer = await fetchDiagramFromKroki(mermaidCode);
    assert.ok(Buffer.isBuffer(imageBuffer), 'Result is a buffer');
    assert.ok(imageBuffer.length > 100, 'Buffer has image bytes');
  });
  ```
- [ ] **Step 2: Run test and verify it fails**
  Run: `node --test test/kroki.test.js`
  Expected Output: Fail (function not defined)
- [ ] **Step 3: Implement `fetchDiagramFromKroki` in `src/kroki.js`**
  Create `src/kroki.js` containing:
  ```javascript
  const axios = require('axios');
  const pako = require('pako'); // Kroki accepts deflated Base64 payloads

  async function fetchDiagramFromKroki(mermaidSyntax) {
    // 1. Deflate the mermaid code using pako (compression)
    const textEncoder = new TextEncoder();
    const data = textEncoder.encode(mermaidSyntax);
    const compressed = pako.deflate(data, { level: 9 });
    
    // 2. Encode to base64 safe characters
    const base64 = Buffer.from(compressed)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const krokiUrl = `https://kroki.io/mermaid/png/${base64}`;
    
    // 3. Request png bytes
    const response = await axios.get(krokiUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  }

  module.exports = { fetchDiagramFromKroki };
  ```
- [ ] **Step 4: Install `pako` compression module**
  Run: `npm install pako`
- [ ] **Step 5: Run tests and verify they pass**
  Run: `node --test test/kroki.test.js`
  Expected Output: `PASS`
- [ ] **Step 6: Commit**
  Run:
  ```bash
  git add src/kroki.js test/kroki.test.js package.json package-lock.json
  git commit -m "feat: integrate cloud-rendered diagram fetching via Kroki API"
  ```

---

### Task 4: Core Payload Compiler (`src/compiler.js`)
**Files:**
* Create: `src/compiler.js`
* Test: `test/compiler-flow.test.js`

- [ ] **Step 1: Write test for parsing JSON and converting to docx**
  Create `test/compiler-flow.test.js` containing:
  ```javascript
  const test = require('node:test');
  const assert = require('node:assert');
  const fs = require('fs');
  const path = require('path');
  const { compilePayloadToDocx } = require('../src/compiler');

  test('Compile JSON payload to Docx', async () => {
    const payload = {
      language: "en",
      target_audience: "client",
      writing_style: "corporate",
      target_path: "/dummy/path",
      document_title: "Test Doc",
      sections: [
        {
          id: 1,
          title: "Introduction Section",
          content: "This is a basic text describing the software.",
          diagrams: [
            {
              caption: "Simple Diagram",
              mermaid_code: "graph TD\nStart --> End"
            }
          ],
          screenshot_tags: [
            {
              target_file: "index.js",
              line_number: 10,
              instruction: "Show config screen"
            }
          ]
        }
      ]
    };

    const outPath = path.join(__dirname, 'output_test.docx');
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

    await compilePayloadToDocx(payload, path.join(__dirname, '../template.docx'), outPath);
    assert.ok(fs.existsSync(outPath), 'Document compiled successfully');
    
    if (fs.existsSync(outPath)) fs.unlinkSync(outPath);
  });
  ```
- [ ] **Step 2: Run test and verify it fails**
  Run: `node --test test/compiler-flow.test.js`
  Expected Output: Fail (compilePayloadToDocx not defined)
- [ ] **Step 3: Implement `compilePayloadToDocx` in `src/compiler.js`**
  Create `src/compiler.js` containing:
  ```javascript
  const fs = require('fs');
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun } = require('docx');
  const { fetchDiagramFromKroki } = require('./kroki');

  async function compilePayloadToDocx(payload, templatePath, outputPath) {
    // Note: Instead of complex template injection, we read and build docx elements
    const docChildren = [
      new Paragraph({
        text: payload.document_title || "Codebase Documentation",
        heading: HeadingLevel.HEADING_1,
      }),
      new Paragraph({
        text: `Target Path: ${payload.target_path} | Target Audience: ${payload.target_audience} | Style: ${payload.writing_style || 'corporate'}`,
        spacing: { after: 200 }
      })
    ];

    for (const section of payload.sections) {
      // Append Heading 2
      docChildren.push(new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 }
      }));

      // Append content body paragraphs
      const lines = section.content.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          docChildren.push(new Paragraph({
            children: [new TextRun({ text: line, font: "Segoe UI" })],
            spacing: { after: 100 }
          }));
        }
      }

      // Fetch and embed Kroki diagram images
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
              spacing: { before: 120, after: 120 }
            }));
            docChildren.push(new Paragraph({
              text: `Diagram: ${diag.caption}`,
              spacing: { after: 120 }
            }));
          } catch (err) {
            docChildren.push(new Paragraph({
              text: `[Error rendering diagram: ${diag.caption}]`,
              spacing: { after: 120 }
            }));
          }
        }
      }

      // Insert Highlighted Screenshot Tag Callout Tables
      if (section.screenshot_tags && section.screenshot_tags.length > 0) {
        const { Table, TableRow, TableCell, BorderStyle, WidthType } = require('docx');
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
              left: { style: BorderStyle.SINGLE, size: 36, color: "FF0000" }, // thick red left border
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "F9F2F2" }, // light pinkish gray background
                    margins: { top: 120, bottom: 120, left: 180, right: 180 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `[📸 DEV SCREENSHOT REQUIRED: ${tag.instruction} in ${tag.target_file}:${tag.line_number}]`,
                            bold: true,
                            color: "FF0000",
                            font: "Arial",
                          })
                        ],
                      })
                    ]
                  })
                ]
              })
            ]
          }));
          docChildren.push(new Paragraph({ text: "", spacing: { after: 100 } })); // small spacing after table
        }
      }
    }

    const doc = new Document({
      sections: [{
        children: docChildren,
      }],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
  }

  module.exports = { compilePayloadToDocx };
  ```
- [ ] **Step 4: Run test to verify it passes**
  Run: `node --test test/compiler-flow.test.js`
  Expected Output: `PASS`
- [ ] **Step 5: Commit**
  Run:
  ```bash
  git add src/compiler.js test/compiler-flow.test.js
  git commit -m "feat: implement structured content compilation to Word (.docx)"
  ```

---

### Task 5: Interactive CLI Setup & Main Command Line (`src/index.js`)
**Files:**
* Create: `src/index.js`
* Create: `test/sample-payload.json`

- [ ] **Step 1: Create a mock `test/sample-payload.json`**
  Write a complete JSON payload structure covering the multi-language outputs and structural requirements.
- [ ] **Step 2: Implement CLI and Parameter Parsing in `src/index.js`**
  Write CLI orchestrator:
  - If `--payload` is passed, run compile directly.
  - If no payload, trigger interactive prompts via `prompts` module (ask target path, language, audience, checklists).
  - Write `execution-summary.md` detailing time, subagents summary details, Kroki outputs, and paths.
- [ ] **Step 3: Dry run compilation manually**
  Run: `node src/index.js --payload test/sample-payload.json --output document-code-demo.docx`
  Check: Verify output `document-code-demo.docx` and `execution-summary.md` exist and contain structured information.
- [ ] **Step 4: Commit**
  Run:
  ```bash
  git add src/index.js test/sample-payload.json
  git commit -m "feat: configure main CLI entrypoint with support for interactive configuration and payload compilation"
  ```
