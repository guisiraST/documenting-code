const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { compilePayloadToDocx } = require('../src/compiler');
const { generateTemplateIfMissing } = require('../src/setup');

test('Compile JSON payload to Docx', async () => {
  const payload = {
    language: "en",
    target_audience: "dev_team",
    writing_style: "corporate",
    target_path: "/dummy/path",
    document_title: "Test Project Documentation",
    sections: [
      {
        id: 1,
        title: "Overview Section",
        content: "This is a basic overview content describing the test application.",
        diagrams: [
          {
            caption: "System Architecture Flow",
            mermaid_code: "graph TD\n  Client --> Server"
          }
        ],
        screenshot_tags: [
          {
            target_file: "src/index.js",
            line_number: 10,
            instruction: "Verify the entrypoint configuration."
          }
        ]
      }
    ]
  };

  const templatePath = path.join(__dirname, 'test_template.docx');
  const outputPath = path.join(__dirname, 'test_output.docx');

  // Prepare files
  if (fs.existsSync(templatePath)) fs.unlinkSync(templatePath);
  if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

  // Generate a test template
  await generateTemplateIfMissing(templatePath);

  // Compile
  await compilePayloadToDocx(payload, templatePath, outputPath);

  // Asserts
  assert.ok(fs.existsSync(outputPath), 'Output document was generated successfully.');
  const stats = fs.statSync(outputPath);
  assert.ok(stats.size > 2000, 'Output document has content bytes');

  // Cleanup
  if (fs.existsSync(templatePath)) fs.unlinkSync(templatePath);
  if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
});
