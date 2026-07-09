const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- Start Full 9-Section Workflow Simulation (document-code Mockup) ---');

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
console.log('Writing simulated config.json for document-code mockup...');
fs.writeFileSync(path.join(tmpDir, 'config.json'), JSON.stringify({
  target_path: targetProjectPath,
  language: "th",
  target_audience: "dev_team",
  writing_style: "educational",
  sections: ["1", "2", "3", "4", "5", "6", "7", "8", "9"]
}, null, 2));

// 4. Write mock files for all 9 sections detailing document-code itself
console.log('Writing all 9 simulated section content files...');

const mockSections = [
  {
    id: 1,
    title: "1. ภาพรวมระบบและวัตถุประสงค์ (System Overview & Goals)",
    content: "ระบบ 'document-code' เป็นเครื่องมือสร้างเอกสารเชิงเทคนิคอัตโนมัติจากซอร์สโค้ดในโปรเจกต์ (Automated CLI Document Compiler)\nโดยมีเป้าหมายเพื่อช่วยลดภาระงานของนักพัฒนาในการเขียนเอกสารอธิบายการทำงานของระบบหลังบ้าน โครงสร้างการเชื่อมต่อ และการปักหมุดจุดตรวจสอบโค้ดแบบไม่ต้องสร้างความยุ่งเหยิงในไดเรกทอรีของโปรเจกต์เป้าหมาย",
    diagrams: [],
    screenshot_tags: []
  },
  {
    id: 2,
    title: "2. การออกแบบสถาปัตยกรรมระบบ (Architecture & Component Design)",
    content: "สถาปัตยกรรมทำงานในลักษณะ Orchestrator-Worker โดยแบ่งขั้นตอนการรันออกเป็น 3 ขั้นตอนหลักคือ:\n1. Interactive Setup Wizard สำหรับรวบรวมค่าพารามิเตอร์ความต้องการจากผู้ใช้งานและบันทึกใส่ tmp/config.json\n2. Codebase Scanner & AI Analysis สำหรับการอ่านซอร์สโค้ดและส่งต่อให้ Parallel Subagents ทำการสรุปผลและเขียนเก็บข้อมูลรายหัวข้อลงในโฟลเดอร์ tmp/ ของ Skill\n3. Patch Document Compiler สำหรับอ่านข้อมูลจากโฟลเดอร์ tmp/ มารวมกันคอมไพล์เป็นไฟล์ Word (.docx) และทำความสะอาดเคลียร์ไฟล์ชั่วคราวทิ้งทั้งหมด",
    diagrams: [
      {
        caption: "สถาปัตยกรรมการไหลของข้อมูลและการประมวลผลเอกสาร",
        mermaid_code: "graph TD\n  Wizard[Interactive Setup Wizard] -->|Write config.json| Tmp[Skill tmp/ directory]\n  Subagents[Parallel Worker Agents] -->|Write section_*.json| Tmp\n  Tmp -->|Compile & Patch| Compiler[Docx Patch Compiler]\n  Compiler -->|Output| Word[Word Document .docx]\n  Compiler -->|Triggers| Cleanup[Temporary Files Cleanup]"
      }
    ],
    screenshot_tags: []
  },
  {
    id: 3,
    title: "3. โครงสร้างซอร์สโค้ดและโมดูลระบบ (Code Structure & Modules)",
    content: "การจัดหมวดหมู่โมดูลยึดหลักแยกความรับผิดชอบอย่างเป็นเอกเทศ (Single Responsibility Principle):\n* `src/index.js` - โมดูลหลักสำหรับประมวลผลคำสั่ง CLI พารามิเตอร์ และการรันเมนู Interactive Prompt\n* `src/setup.js` - ทำหน้าที่ตรวจสอบและสร้างเอกสารแม่แบบสไตล์เริ่มต้น (Minimalist template.docx)\n* `src/kroki.js` - ไคลเอนต์ติดต่อ Cloud Kroki API เพื่อขอรับไฟล์แผนผัง PNG แบบออฟไลน์\n* `src/compiler.js` - ตัวจัดการเขียนเอกสาร Word ผ่านการแพตช์ตัวแปร `{{content}}` ในแม่แบบเริ่มต้น",
    diagrams: [],
    screenshot_tags: []
  },
  {
    id: 4,
    title: "4. โครงสร้างฐานข้อมูลและการจัดการสถานะชั่วคราว (Data Model & State)",
    content: "เพื่อความเป็นระเบียบและไม่รบกวนโปรเจกต์ที่นำมาจัดทำเอกสาร ระบบเลือกบันทึกข้อมูลและวิเคราะห์แบบไร้ฐานข้อมูล (Stateless Execution) โดยบันทึกสถานะลงไฟล์โครงสร้าง JSON ชั่วคราวภายใต้โฟลเดอร์ `tmp/` ของ Skill เท่านั้น",
    diagrams: [
      {
        caption: "โครงสร้างความสัมพันธ์ข้อมูลชั่วคราว (Temporary Metadata Relationships)",
        mermaid_code: "erDiagram\n  CONFIG_JSON ||--o{ SECTION_JSON : configures\n  SECTION_JSON ||--|| WORD_DOCUMENT : compiles"
      }
    ],
    screenshot_tags: []
  },
  {
    id: 5,
    title: "5. ข้อกำหนดการรันคำสั่ง CLI (CLI API Specifications)",
    content: "ระบบสนับสนุนการรันคำสั่งใน 2 โหมดการทำงานผ่าน Command Line:\n1. โหมด Wizard: `node src/index.js` (เปิดหน้ากากเมนูเลือกตั้งค่า)\n2. โหมด Compile: `node src/index.js --compile --output <path>` (คอมไพล์เอกสาร Word จาก tmp และล้างข้อมูลชั่วคราวอัตโนมัติ)",
    diagrams: [],
    screenshot_tags: []
  },
  {
    id: 6,
    title: "6. ขั้นตอนการประมวลผลเอกสารหลังบ้าน (Internal Operational Workflows)",
    content: "ขั้นตอนการคอมไพล์เอกสารอธิบายการทำงานทำงานอย่างเป็นลำดับขั้นเพื่อตรวจสอบความถูกต้องของข้อมูลทั้งหมดก่อนจัดเก็บและล้างข้อมูล:",
    diagrams: [
      {
        caption: "ลำดับการคอมไพล์และการจัดการไฟล์ชั่วคราว (Compilation & Cleanup Flow)",
        mermaid_code: "sequenceDiagram\n  MainAgent->>Compiler: Run with --compile flag\n  Compiler->>Compiler: Read tmp/config.json\n  loop For each section\n    Compiler->>Compiler: Read tmp/section_*.json\n  end\n  Compiler->>Kroki: Fetch PNG diagrams\n  Compiler->>Compiler: Patch template.docx\n  Compiler->>MainAgent: Write output Word & summary\n  Compiler->>Compiler: Delete all tmp/ folder files"
      }
    ],
    screenshot_tags: []
  },
  {
    id: 7,
    title: "7. ความปลอดภัยและการรันแบบปิด (Security & Privacy)",
    content: "เอกสารถูกสร้างขึ้นภายในเครื่องโดยไม่มีการส่งรหัสโครงสร้างหรือไฟล์โค้ดไปวิเคราะห์นอกระบบ แผนผังภาพใช้การ Deflate รหัสของแผนผังส่งไปเรนเดอร์รูปภาพผ่าน API สาธารณะของ Kroki ซึ่งไม่สามารถแกะโครงสร้างโค้ดกลับมาได้ ทำให้ปลอดภัยและรักษาความเป็นส่วนตัวของซอร์สโค้ดระบบสูงสุด",
    diagrams: [],
    screenshot_tags: []
  },
  {
    id: 8,
    title: "8. คู่มือเริ่มต้นสำหรับนักพัฒนาและติดตั้ง (Developer Onboarding)",
    content: "ขั้นตอนการนำไปติดตั้งใช้งานในระบบของตัวแทนพัฒนา:\n1. ตรวจสอบ Node.js (เวอร์ชัน 18 ขึ้นไป)\n2. ทำการติดตั้งด้วยคำสั่งเพิ่มทักษะ:\n   ```bash\n   npx skills add https://github.com/guisiraST/documenting-code --skill documenting-code\n   ```\n3. รันคำสั่งทดสอบระบบโลคอล: `npm test`",
    diagrams: [],
    screenshot_tags: []
  },
  {
    id: 9,
    title: "9. ภาคผนวกตรวจสอบภาพหน้าจอระบบ (Interactive Screenshots)",
    content: "ป้ายตรวจสอบ screenshot ที่ฝังไว้เพื่อให้นักพัฒนาปักรูปภาพหน้าจอเมนูที่รันจริงในระบบและแสดงผลการตั้งค่า:",
    diagrams: [],
    screenshot_tags: [
      {
        target_file: "src/index.js",
        line_number: 12,
        instruction: "บันทึกภาพหน้าจอการเรียกใช้งาน Setup Wizard ที่แสดงผลบนหน้าจอ Terminal"
      },
      {
        target_file: "src/index.js",
        line_number: 40,
        instruction: "บันทึกภาพหน้าจอขณะที่คอมไพเลอร์ทำการแสดงผลลัพธ์สำเร็จการคอมไพล์เอกสารสำเร็จรูป"
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
