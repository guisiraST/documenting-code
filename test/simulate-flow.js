const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('--- Start Workflow Simulation ---');

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

// 2. Step 4: Simulate AI Agent writing mock config and section files inside skill's tmp folder
console.log('Creating local tmp folder in skill...');
fs.mkdirSync(tmpDir, { recursive: true });

console.log('Writing simulated config.json...');
fs.writeFileSync(path.join(tmpDir, 'config.json'), JSON.stringify({
  target_path: targetProjectPath,
  language: "th",
  target_audience: "dev_team",
  writing_style: "educational",
  sections: ["1", "9"]
}, null, 2));

console.log('Writing simulated section content files...');
fs.writeFileSync(path.join(tmpDir, 'section_1.json'), JSON.stringify({
  id: 1,
  title: "1. ภาพรวมระบบ (System Overview - Simulated)",
  content: "นี่คือข้อมูลการจำลองภาพรวมระบบของโครงการ\nทุกคำสั่งงานประมวลผลผ่านโมดูลหลักเพื่อตรวจสอบความถูกต้อง",
  diagrams: [],
  screenshot_tags: []
}, null, 2));

fs.writeFileSync(path.join(tmpDir, 'section_9.json'), JSON.stringify({
  id: 9,
  title: "9. ภาคผนวกและปักหมุดภาพ (Appendix - Simulated)",
  content: "นี่คือข้อมูลจำลองภาคผนวกสำหรับการบันทึกภาพหน้าจอยืนยันความสอดคล้อง",
  diagrams: [],
  screenshot_tags: [
    {
      target_file: "src/index.js",
      line_number: 10,
      instruction: "บันทึกภาพหน้าจอการเรียกใช้งาน CLI"
    }
  ]
}, null, 2));

// 3. Step 5 & 6: Run compiler command to build word and trigger cleanup
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

// 4. Verify results
console.log('Verifying workflow results...');
const wordExists = fs.existsSync(outputWordPath);
const summaryExists = fs.existsSync(summaryPath);
const tmpCleaned = !fs.existsSync(tmpDir);

console.log(`- Word document created in project path: ${wordExists ? '✅ YES' : '❌ NO'}`);
console.log(`- Execution summary created in project path: ${summaryExists ? '✅ YES' : '❌ NO'}`);
console.log(`- Local tmp folder cleaned up/deleted: ${tmpCleaned ? '✅ YES' : '❌ NO'}`);

if (wordExists && summaryExists && tmpCleaned) {
  console.log('\n🎉 ALL WORKFLOW SIMULATION TESTS PASSED SUCCESSFULLY!');
} else {
  console.error('\n❌ WORKFLOW SIMULATION TEST FAILED!');
  process.exit(1);
}
