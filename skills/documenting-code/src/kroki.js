const axios = require('axios');
const pako = require('pako');

async function fetchDiagramFromKroki(mermaidSyntax) {
  try {
    // 1. Convert string to Uint8Array UTF-8 bytes
    const data = Buffer.from(mermaidSyntax, 'utf8');
    
    // 2. Deflate (compress) the UTF-8 bytes
    const compressed = pako.deflate(data, { level: 9 });
    
    // 3. Convert to URL-Safe Base64 (replace '+' with '-' and '/' with '_')
    const base64 = Buffer.from(compressed)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const url = `https://kroki.io/mermaid/png/${base64}`;

    // 4. Request the PNG image bytes from Kroki API
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
    return Buffer.from(response.data);
  } catch (error) {
    // Graceful error fallback logging
    console.warn(`[Kroki API Warning] Failed to render diagram. Error: ${error.message}`);
    throw error; // Let the caller (compiler) handle the fallback formatting
  }
}

module.exports = { fetchDiagramFromKroki };
