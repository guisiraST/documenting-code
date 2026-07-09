const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- Start Full 9-Section Workflow Simulation ---');

const skillDir = path.join(__dirname, '..');
const tmpDir = path.join(skillDir, 'tmp');
const targetProjectPath = path.join(skillDir, 'test');
const outputWordPath = path.join(targetProjectPath, 'simulated_documentation.docx');

// 1. Clean up any leftover files from previous runs
if (fs.existsSync(tmpDir)) {
  const files = fs.readdirSync(tmpDir);
  for (const file of files) {
    fs.unlinkSync(path.join(tmpDir, file));
  }
  fs.rmdirSync(tmpDir);
}
if (fs.existsSync(outputWordPath)) fs.unlinkSync(outputWordPath);
const summaryPath = path.join(targetProjectPath, 'execution-summary.md');
if (fs.existsSync(summaryPath)) fs.unlinkSync(summaryPath);

// 2. Create local tmp folder in skill
console.log('Creating local tmp folder in skill...');
fs.mkdirSync(tmpDir, { recursive: true });

// 3. Write simulated config.json with all 9 sections
console.log('Writing simulated config.json with all 9 sections...');
fs.writeFileSync(path.join(tmpDir, 'config.json'), JSON.stringify({
  target_path: targetProjectPath,
  language: "th",
  target_audience: "dev_team",
  writing_style: "educational",
  sections: ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
}, null, 2));

// 4. Write mock files for all 9 sections
console.log('Writing all 9 simulated section content files...');

const mockSections = [
  {
    id: 1,
    title: "1. ภาพรวมระบบ (System Overview)",
    content: "ระบบ 'marine-excellence' เป็นแอปพลิเคชันระบบหลังบ้าน (Backend) สำหรับประมวลผลเอกสารอัตโนมัติ\nช่วยวิเคราะห์ ตรวจสอบข้อมูล และคัดกรองข้อมูลจากเอกสารรูปแบบต่างๆ เช่น PDF และ Excel",
    diagrams: [],
    screenshot_tags: []
  },
  {
    id: 2,
    title: "2. การออกแบบสถาปัตยกรรมระบบ (Architecture & Component Design)",
    content: "สถาปัตยกรรมหลักได้รับการพัฒนาแบบ MVC/REST API โดยแยกเลเยอร์ Router, Controller, และ Business Service ชัดเจนเพื่อความยืดหยุ่นในการขยายระบบคู่ขนาน",
    diagrams: [
      {
        caption: "ความเชื่อมโยง Component ภายในระบบ",
        mermaid_code: "graph TD\n  Client --> Router[FastAPI Router]\n  Router --> Controller[API Controllers]\n  Controller --> Service[Business Services]"
      }
    ],
    screenshot_tags: []
  },
  {
    id: 3,
    title: "3. โครงสร้างซอร์สโค้ดและโมดูล (Code Structure & Modules)",
    content: "ระบบมีการจัดระเบียบโครงสร้างไดเรกทอรีที่ชัดเจนแบ่งตามหน้าที่การประมวลผล:\n* main.py - ไฟล์หลักในการเชื่อมต่อระบบหลังบ้าน\n* routes/ - จัดเก็บไฟล์โมดูลสำหรับจัดการ API Endpoints\n* business/ - โฟลเดอร์จัดเก็บโมดูลการประมวลผลกฎเชิงธุรกิจ",
    diagrams: [],
    screenshot_tags: []
  },
  {
    id: 4,
    title: "4. ฐานข้อมูลและโครงสร้างข้อมูลระบบ (Database & Data Layer)",
    content: "ระบบมีการจัดเก็บและพักข้อมูลที่ได้จากการสกัดข้อมูลจากตารางโครงสร้าง PDF ชั่วคราว เพื่อเตรียมจัดส่งเข้าสู่โมดูลคัดกรองกฎความสอดคล้อง (Business Rule Matcher)",
    diagrams: [
      {
        caption: "รูปแบบโครงสร้างการไหลของข้อมูลการแปลงเอกสาร (Data Extraction Model)",
        mermaid_code: "erDiagram\n  UploadFile ||--o{ PDF_Process : contains\n  PDF_Process ||--|| JSON_Output : generates"
      }
    ],
    screenshot_tags: []
  },
  {
    id: 5,
    title: "5. ข้อกำหนดการเชื่อมต่อระบบ API (API Specifications)",
    content: "แอปพลิเคชันให้บริการ REST API ในการทำ Verify เอกสารเรือทางกฎเกณฑ์ผ่าน Endpoints สำคัญ:\n* POST /api/ai/verify_doc_marine - รันแบบปกติโดยรับค่าพาธไฟล์\n* POST /api/ai/verify_doc_marine_uploadfile_optimize - รันวิเคราะห์ข้อมูลคู่ขนานขยายขีดความสามารถ",
    diagrams: [],
    screenshot_tags: []
  },
  {
    id: 6,
    title: "6. กลไกการทำงานภายใน (Operational Workflows & Logic)",
    content: "การประมวลผลแบบคู่ขนานผ่าน asyncio.gather ช่วยให้อัปโหลดไฟล์และสกัดกฎเชิงธุรกิจพร้อมกันเป็นสเต็ปขนานกันก่อนจัดรวมความถูกต้องของเอกสาร",
    diagrams: [
      {
        caption: "กระบวนการสกัดข้อมูลเอกสารคู่ขนาน (Asynchronous Extraction Workflow)",
        mermaid_code: "sequenceDiagram\n  Client->>Router: Upload Request\n  par Process Q88\n    Router->>Parser: Q88 Processing\n  and Process SIRE\n    Router->>Parser: SIRE Processing\n  end\n  Parser-->>Router: Merged Result\n  Router-->>Client: Response Data"
      }
    ],
    screenshot_tags: []
  },
  {
    id: 7,
    title: "7. ความปลอดภัยและมาตรฐานของระบบ (Security & Compliance)",
    content: "ระบบใช้กลไกการรักษาความปลอดภัยโดยเปิดใช้งาน CORS Middleware อนุญาตเฉพาะแหล่งที่มาขององค์กรที่ปลอดภัยในกลุ่ม domain *.pttgrp.com และ *.pttdigital.com เท่านั้น",
    diagrams: [],
    screenshot_tags: []
  },
  {
    id: 8,
    title: "8. คู่มือเริ่มต้นการพัฒนาระบบและการติดตั้ง (Developer Onboarding & Deployment)",
    content: "การติดตั้งระบบเพื่อรันพัฒนาโลคอล:\n1. pip install -r requirements.txt\n2. uvicorn main:app --reload --port 8000\n3. docker build -t marine-excellence .",
    diagrams: [],
    screenshot_tags: []
  },
  {
    id: 9,
    title: "9. ภาคผนวกและปักหมุดภาพ (Appendix & Screenshots)",
    content: "สำหรับการตรวจสอบความสอดคล้องในการรันระบบให้ทำการบันทึกภาพหน้าจอการทำงานเพื่อความสมบูรณ์ของรายงาน:",
    diagrams: [],
    screenshot_tags: [
      {
        target_file: "src/ai/main.py",
        line_number: 7,
        instruction: "บันทึกภาพหน้าจอหน้ารายการเอกสาร API Docs ที่เปิดผ่าน /api/ai/docs"
      },
      {
        target_file: "src/ai/main.py",
        line_number: 19,
        instruction: "บันทึกภาพหน้าจอ CORS Middleware configuration เพื่อยืนยันความปลอดภัยในการสื่อสาร"
      }
    ]
  }
];

for (const section of mockSections) {
  const filePath = path.join(tmpDir, `section_${section.id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(section, null, 2));
}

// 5. Run compiler command to build word and trigger cleanup
console.log('Executing compilation...');
try {
  const compileCommand = `node ${path.join(skillDir, 'src/index.js')} --compile --output "${outputWordPath}"`;
  console.log(`Running command: ${compileCommand}`);
  const stdout = execSync(compileCommand, { cwd: skillDir, encoding: 'utf8' });
  console.log(stdout);
} catch (err) {
  console.error('Compilation failed:', err.message);
  process.exit(1);
}

// 6. Verify results
console.log('Verifying workflow results...');
const wordExists = fs.existsSync(outputWordPath);
const summaryExists = fs.existsSync(summaryPath);
const tmpCleaned = !fs.existsSync(tmpDir);

console.log(`- Word document created in project path: ${wordExists ? '✅ YES' : '❌ NO'}`);
console.log(`- Execution summary created in project path: ${summaryExists ? '✅ YES' : '❌ NO'}`);
console.log(`- Local tmp folder cleaned up/deleted: ${tmpCleaned ? '✅ YES' : '❌ NO'}`);

if (wordExists && summaryExists && tmpCleaned) {
  console.log('\n🎉 ALL 9-SECTION WORKFLOW SIMULATION TESTS PASSED SUCCESSFULLY!');
} else {
  console.error('\n❌ WORKFLOW SIMULATION TEST FAILED!');
  process.exit(1);
}
