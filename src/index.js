#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const prompts = require('prompts');
const { compilePayloadToDocx } = require('./compiler');
const { generateTemplateIfMissing } = require('./setup');

async function main() {
  const args = process.argv.slice(2);
  let payloadPath = null;
  let outputPath = null;
  let compileMode = false;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--compile') {
      compileMode = true;
    } else if (args[i] === '--payload' && args[i + 1]) {
      payloadPath = args[i + 1];
      i++;
    } else if (args[i] === '--output' && args[i + 1]) {
      outputPath = args[i + 1];
      i++;
    }
  }

  const tmpDir = path.join(process.cwd(), '.document-code-tmp');

  // 1. New Local Tmp folder compile mode
  if (compileMode) {
    const configPath = path.join(tmpDir, 'config.json');
    if (!fs.existsSync(configPath)) {
      console.error(`Error: Config file not found at ${configPath}. Please run the setup wizard first.`);
      process.exit(1);
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const targetPath = config.target_path;
    const finalOutputPath = outputPath || path.join(targetPath, 'documentation.docx');
    const outputDir = path.dirname(finalOutputPath);
    fs.mkdirSync(outputDir, { recursive: true });

    // Assemble payload sections from individual tmp files
    const sections = [];
    for (const sectionId of config.sections) {
      const sectionFile = path.join(tmpDir, `section_${sectionId}.json`);
      if (fs.existsSync(sectionFile)) {
        sections.push(JSON.parse(fs.readFileSync(sectionFile, 'utf8')));
      } else {
        console.warn(`Warning: Section file for section ${sectionId} not found. Skipping.`);
      }
    }

    const payload = {
      language: config.language,
      target_audience: config.target_audience,
      writing_style: config.writing_style,
      target_path: targetPath,
      document_title: `เอกสารรายละเอียดระบบงานเทคนิค (Technical Specifications) - ${path.basename(targetPath)}`,
      sections: sections
    };

    const templatePath = path.join(__dirname, '../template.docx');
    await generateTemplateIfMissing(templatePath);

    console.log(`Starting compilation of ${payload.document_title}...`);
    const startTime = Date.now();

    try {
      await compilePayloadToDocx(payload, templatePath, finalOutputPath);
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`Successfully compiled Word document to: ${finalOutputPath} in ${elapsedTime}s`);

      // Write execution-summary.md next to documentation.docx in target path
      await writeExecutionSummary(payload, finalOutputPath, elapsedTime, outputDir);

      // Clean up all generated files in the local tmp directory and rmdir
      console.log('Cleaning up temporary content files...');
      if (fs.existsSync(tmpDir)) {
        const files = fs.readdirSync(tmpDir);
        for (const file of files) {
          fs.unlinkSync(path.join(tmpDir, file));
        }
        fs.rmdirSync(tmpDir);
      }
      console.log('Cleanup completed successfully.');
    } catch (err) {
      console.error(`Compilation failed: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  // 2. Direct compilation mode (Kept for backwards compatibility and test runner)
  if (payloadPath) {
    if (!fs.existsSync(payloadPath)) {
      console.error(`Error: Payload file not found at ${payloadPath}`);
      process.exit(1);
    }

    const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
    const targetPath = payload.target_path || process.cwd();
    const finalOutputPath = outputPath || path.join(targetPath, 'documentation.docx');
    const outputDir = path.dirname(finalOutputPath);
    fs.mkdirSync(outputDir, { recursive: true });

    const templatePath = path.join(__dirname, '../template.docx');
    await generateTemplateIfMissing(templatePath);

    console.log(`Starting compilation of ${payload.document_title}...`);
    const startTime = Date.now();

    try {
      await compilePayloadToDocx(payload, templatePath, finalOutputPath);
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`Successfully compiled Word document to: ${finalOutputPath} in ${elapsedTime}s`);

      // Write execution-summary.md
      await writeExecutionSummary(payload, finalOutputPath, elapsedTime, outputDir);
    } catch (err) {
      console.error(`Compilation failed: ${err.message}`);
      process.exit(1);
    }
    return;
  }

  // 2. Interactive setup mode (User launches this)
  console.log('--- document-code Setup Wizard ---');
  
  const response = await prompts([
    {
      type: 'text',
      name: 'target_path',
      message: 'Enter target project directory path to document:',
      initial: '.',
      validate: val => fs.existsSync(val.trim()) ? true : 'Directory path does not exist!'
    },
    {
      type: 'select',
      name: 'language',
      message: 'Select Documentation Language:',
      choices: [
        { title: 'English (en)', value: 'en', description: 'Generate full documentation in English.' },
        { title: 'Thai (th)', value: 'th', description: 'Generate in Thai (tech terms kept in English).' }
      ],
      initial: 0
    },
    {
      type: 'select',
      name: 'target_audience',
      message: 'Select Target Audience:',
      choices: [
        { title: 'Client', value: 'client', description: 'High-level, business-oriented summaries for stakeholders.' },
        { title: 'Developer Team', value: 'dev_team', description: 'Technical, deep-dive specifications for engineering teams.' }
      ],
      initial: 1
    },
    {
      type: 'select',
      name: 'writing_style',
      message: 'Select Writing Style Mode:',
      choices: [
        { title: 'Corporate', value: 'corporate', description: 'Formal, objective, and structured.' },
        { title: 'Educational', value: 'educational', description: 'Step-by-step, warm, and instructional (best for onboarding).' },
        { title: 'Concise', value: 'concise', description: 'Direct, bulleted, and high-density (quick reference).' }
      ],
      initial: 0
    },
    {
      type: 'multiselect',
      name: 'sections',
      message: 'Check/Uncheck desired documentation sections:',
      choices: [
        { title: '1. Overview & Executive Summary', value: '1', selected: true },
        { title: '2. Architecture & Component Design', value: '2', selected: true },
        { title: '3. Code Structure & Modules', value: '3', selected: true },
        { title: '4. Database & Data Layer', value: '4', selected: true },
        { title: '5. API & Integration Specifications', value: '5', selected: true },
        { title: '6. Operational Workflows & Logic', value: '6', selected: true },
        { title: '7. Security & Compliance', value: '7', selected: true },
        { title: '8. Onboarding & Deployment Guide', value: '8', selected: true },
        { title: '9. Interactive Appendix & Screenshots', value: '9', selected: true }
      ],
      hint: '- Space to select. Return to submit'
    }
  ]);

  if (!response.target_path || !response.language || !response.target_audience || !response.writing_style || !response.sections) {
    console.log('\nSetup cancelled.');
    process.exit(0);
  }

  // Resolve absolute path
  const absoluteTargetPath = path.resolve(response.target_path.trim());
  const targetTmpDir = path.join(absoluteTargetPath, '.document-code-tmp');
  fs.mkdirSync(targetTmpDir, { recursive: true });

  const configPath = path.join(targetTmpDir, 'config.json');
  fs.writeFileSync(configPath, JSON.stringify({
    target_path: absoluteTargetPath,
    language: response.language,
    target_audience: response.target_audience,
    writing_style: response.writing_style,
    sections: response.sections
  }, null, 2));

  console.log(`\nConfiguration saved successfully to: ${configPath}`);
  console.log('AI Agent is ready to proceed with parallel subagent analysis based on these preferences.');
}

async function writeExecutionSummary(payload, outputPath, elapsedSeconds, outputDir) {
  const summaryPath = path.join(outputDir, 'execution-summary.md');
  
  // Calculate stats
  let totalDiagrams = 0;
  let totalTags = 0;
  const diagramsList = [];
  const tagsList = [];

  for (const s of payload.sections) {
    if (s.diagrams) {
      totalDiagrams += s.diagrams.length;
      diagramsList.push(...s.diagrams);
    }
    if (s.screenshot_tags) {
      totalTags += s.screenshot_tags.length;
      tagsList.push(...s.screenshot_tags);
    }
  }

  const stats = payload.stats || {};
  const filesDiscovered = stats.files_discovered || 'N/A';
  const filesIgnored = stats.files_ignored || 'N/A';

  const mdContent = `# document-code Execution Step Summary

## Step 1: Initialization
* **Language Selection:** ${payload.language === 'th' ? 'Thai (th)' : 'English (en)'}
* **Target Audience:** ${payload.target_audience === 'client' ? 'Client (Business/High-Level)' : 'Developer Team (Technical/Deep-dive)'}
* **Writing Style Mode:** ${payload.writing_style || 'corporate'}
* **Target Codebase Path:** \`${payload.target_path}\`

## Step 2: Codebase Mapping
* **Total Files Discovered:** ${filesDiscovered}
* **Files/Folders Ignored:** ${filesIgnored}

## Step 3: Subagent Execution Details
* **Spawning Logs:** Parallel workers completed their analytical tasks sequentially.
* **Mermaid.js Render Code Reference:**
${diagramsList.map((d, idx) => `
### Diagram ${idx + 1}: ${d.caption}
\`\`\`mermaid
${d.mermaid_code}
\`\`\`
`).join('')}

## Step 4: Compilation & Assets Summary
* **Total Cloud Diagrams Fetched (Kroki API):** ${totalDiagrams}
* **Total Screenshot Tags Injected:** ${totalTags}
* **Screenshot Tags List:**
${tagsList.map(t => `* \`[📸 DEV SCREENSHOT REQUIRED: ${t.instruction} in ${t.target_file}:${t.line_number}]\``).join('\n')}

---

## Status Report
* **Compilation Status:** ✅ SUCCESS
* **Time Taken:** ${elapsedSeconds} seconds
* **Finalized Document Path:** \`${outputPath}\`
`;

  fs.writeFileSync(summaryPath, mdContent);
  console.log(`Execution summary written to: ${summaryPath}`);
}

main().catch(console.error);
