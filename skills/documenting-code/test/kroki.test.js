const test = require('node:test');
const assert = require('node:assert');
const { fetchDiagramFromKroki } = require('../src/kroki');

test('Fetch Mermaid png diagram from Kroki', async () => {
  const mermaidCode = 'graph TD\nA --> B';
  const imageBuffer = await fetchDiagramFromKroki(mermaidCode);
  
  assert.ok(Buffer.isBuffer(imageBuffer), 'Result is a buffer');
  assert.ok(imageBuffer.length > 100, 'Buffer contains image bytes');
});
