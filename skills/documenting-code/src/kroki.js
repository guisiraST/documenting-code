const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const axios = require('axios');
const pako = require('pako');

async function fetchDiagramFromKroki(mermaidCode) {
  const tmpDir = path.join(process.cwd(), '.document-code-tmp');
  
  // Local mmdc binary path inside the skill's node_modules folder
  const localMmdc = path.resolve(__dirname, '../node_modules/.bin/mmdc');

  if (fs.existsSync(localMmdc) && fs.existsSync(tmpDir)) {
    const tempMmd = path.join(tmpDir, `temp_${Date.now()}.mmd`);
    const tempPng = path.join(tmpDir, `temp_${Date.now()}.png`);
    
    try {
      fs.writeFileSync(tempMmd, mermaidCode, 'utf8');
      execSync(`"${localMmdc}" -i "${tempMmd}" -o "${tempPng}"`, { stdio: 'ignore' });
      
      if (fs.existsSync(tempPng)) {
        const imageBuffer = fs.readFileSync(tempPng);
        return imageBuffer;
      }
    } catch (e) {
      console.warn(`[document-code] Local mmdc rendering failed: ${e.message}. Falling back to Kroki...`);
    } finally {
      if (fs.existsSync(tempMmd)) try { fs.unlinkSync(tempMmd); } catch (e) {}
      if (fs.existsSync(tempPng)) try { fs.unlinkSync(tempPng); } catch (e) {}
    }
  }

  // Fallback to public Kroki API
  console.warn(`[⚠️ Privacy Warning: Local mermaid-cli not found/failed. Falling back to public Kroki API to render diagram.]`);

  try {
    const data = Buffer.from(mermaidCode, 'utf8');
    const compressed = pako.deflate(data, { level: 9 });
    const base64 = Buffer.from(compressed)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    const url = `https://kroki.io/mermaid/png/${base64}`;
    const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 8000 });
    return Buffer.from(response.data);
  } catch (error) {
    console.warn(`[Kroki API Warning] Failed to render diagram. Error: ${error.message}`);
    throw error;
  }
}

module.exports = { fetchDiagramFromKroki };
