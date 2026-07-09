const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { generateTemplateIfMissing } = require('../src/setup');

test('Generate template file if missing', async () => {
  const tempPath = path.join(__dirname, 'temp_template.docx');
  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

  await generateTemplateIfMissing(tempPath);
  
  assert.ok(fs.existsSync(tempPath), 'template.docx was created');

  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
});
