const path = require('path');
const fs = require('fs');

let puppeteer;
try {
  puppeteer = require('puppeteer-core');
} catch (e) {
  puppeteer = require(path.resolve(__dirname, '../frontend/node_modules/puppeteer-core'));
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '../output/screenshots');
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGV4X2NoZW4iLCJ1c2VyX2lkIjoiNGJhYzQ1ZjgtMzFmNC00MWFhLWFjYmEtZmJjMWU3MjhmZDVkIiwiZXhwIjoxNzg4ODUwMjYzLCJ0eXBlIjoiYWNjZXNzIn0.oK5mBGoAMrfSA3bZBx5KaiedQ0_VvmFBtV-deF05h2s';

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 850, deviceScaleFactor: 2 });

  // 1. Landing Page
  console.log('Capturing 01_landing_page.png...');
  await page.goto('http://127.0.0.1:3000/', { waitUntil: 'networkidle0' });
  await page.evaluate(() => localStorage.clear());
  await sleep(400);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01_landing_page.png') });

  // 2. Onboarding Modal Steps (1 to 4)
  console.log('Capturing onboarding steps...');
  await page.goto('http://127.0.0.1:3000/dashboard', { waitUntil: 'networkidle0' });
  await page.evaluate((tok) => {
    localStorage.setItem('token', tok);
    localStorage.removeItem('cloudseclab_onboarding_completed');
  }, TOKEN);
  await page.goto('http://127.0.0.1:3000/dashboard', { waitUntil: 'networkidle0' });
  await sleep(600);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05_onboarding_step1.png') });

  // Click Next for steps 2, 3, 4
  const nextBtn1 = await page.$('button ::-p-text(Next)');
  if (nextBtn1) {
    await nextBtn1.click();
    await sleep(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, '06_onboarding_step2.png') });

    const nextBtn2 = await page.$('button ::-p-text(Next)');
    if (nextBtn2) {
      await nextBtn2.click();
      await sleep(400);
      await page.screenshot({ path: path.join(OUTPUT_DIR, '07_onboarding_step3.png') });

      const nextBtn3 = await page.$('button ::-p-text(Next)');
      if (nextBtn3) {
        await nextBtn3.click();
        await sleep(400);
        await page.screenshot({ path: path.join(OUTPUT_DIR, '08_onboarding_step4.png') });
      }
    }
  }

  // Set onboarding completed
  await page.evaluate(() => localStorage.setItem('cloudseclab_onboarding_completed', 'true'));

  // 3. Level Browser with filters
  console.log('Capturing 02_level_browser.png...');
  await page.goto('http://127.0.0.1:3000/levels', { waitUntil: 'networkidle0' });
  await sleep(500);
  // Click 'Identity & IAM' topic pill
  const iamPill = await page.$('button ::-p-text(Identity & IAM)');
  if (iamPill) {
    await iamPill.click();
    await sleep(400);
  }
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02_level_browser.png') });

  // 4. Lab Workspace Desktop (LevelDetail.tsx)
  console.log('Capturing 03_lab_workspace_desktop.png...');
  await page.goto('http://127.0.0.1:3000/levels/1', { waitUntil: 'networkidle0' });
  await sleep(600);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03_lab_workspace_desktop.png') });

  // 5. Lab Workspace Mobile
  console.log('Capturing 04_lab_workspace_mobile.png...');
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto('http://127.0.0.1:3000/levels/1', { waitUntil: 'networkidle0' });
  await sleep(500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04_lab_workspace_mobile.png') });

  // Reset viewport to desktop
  await page.setViewport({ width: 1366, height: 850, deviceScaleFactor: 2 });

  // 6. Dashboard
  console.log('Capturing 09_dashboard.png...');
  await page.goto('http://127.0.0.1:3000/dashboard', { waitUntil: 'networkidle0' });
  await sleep(500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '09_dashboard.png') });

  // 7. Profile Page
  console.log('Capturing 10_profile.png...');
  await page.goto('http://127.0.0.1:3000/profile', { waitUntil: 'networkidle0' });
  await sleep(500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '10_profile.png') });

  // 8. Leaderboard
  console.log('Capturing 11_leaderboard.png...');
  await page.goto('http://127.0.0.1:3000/leaderboard', { waitUntil: 'networkidle0' });
  await sleep(600);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '11_leaderboard.png') });

  // 9. Exam Screen
  console.log('Capturing 12_exam_screen.png...');
  await page.goto('http://127.0.0.1:3000/exam/beginner', { waitUntil: 'networkidle0' });
  await sleep(700);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '12_exam_screen.png') });

  // 10. Certificates List
  console.log('Capturing 13_certificates_list.png...');
  await page.goto('http://127.0.0.1:3000/certificates', { waitUntil: 'networkidle0' });
  await sleep(500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '13_certificates_list.png') });

  // 11. Public Certificate Verification Page
  console.log('Capturing 14_verify_certificate.png...');
  await page.goto('http://127.0.0.1:3000/verify/CSL-2026-BGN-98F2A10B', { waitUntil: 'networkidle0' });
  await sleep(500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '14_verify_certificate.png') });
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'certificate_verify_page.png') });

  // Concept Diagrams in Context
  const conceptPages = [
    { level: 1, name: 'concept_01_shared_responsibility.png' },
    { level: 3, name: 'concept_02_iam_trust.png' },
    { level: 7, name: 'concept_03_s3_policy.png' },
    { level: 10, name: 'concept_04_vpc_layout.png' },
    { level: 9, name: 'concept_05_cloudtrail_flow.png' },
    { level: 20, name: 'concept_06_kms_encryption.png' },
    { level: 26, name: 'concept_07_azure_rbac.png' },
    { level: 35, name: 'concept_08_gcp_service_account.png' },
    { level: 50, name: 'concept_09_generic_fallback.png' },
  ];

  for (const c of conceptPages) {
    console.log(`Capturing ${c.name}...`);
    await page.goto(`http://127.0.0.1:3000/levels/${c.level}`, { waitUntil: 'networkidle0' });
    await sleep(400);
    await page.screenshot({ path: path.join(OUTPUT_DIR, c.name) });
  }

  // Also render certificate HTML/PDF preview to image
  console.log('Capturing certificate_pdf_sample.png...');
  // We can render a certificate preview page or HTML canvas
  await page.goto('http://127.0.0.1:3000/verify/CSL-2026-BGN-98F2A10B', { waitUntil: 'networkidle0' });
  await sleep(400);

  // Let's create an elegant full certificate preview in browser
  await page.evaluate(() => {
    document.body.innerHTML = `
      <div style="background:#12161C; width:1000px; height:680px; margin:20px auto; border:3px solid #4FB6A8; border-radius:12px; padding:40px 50px; font-family:'Inter',sans-serif; color:#E7EAEE; position:relative; box-sizing:border-box;">
        <div style="border:1px solid #26303D; position:absolute; inset:8px; border-radius:8px; pointer-events:none;"></div>
        
        <div style="text-align:center; margin-top:20px;">
          <div style="font-family:'JetBrains Mono',monospace; font-weight:800; font-size:28px; letter-spacing:2px; color:#4FB6A8;">CLOUDSECLAB</div>
          <div style="font-size:12px; color:#8B95A5; text-transform:uppercase; letter-spacing:1px; margin-top:6px; font-family:'JetBrains Mono',monospace;">OFFICIAL VERIFIABLE CERTIFICATE OF PROFICIENCY</div>
        </div>

        <div style="text-align:center; margin-top:50px;">
          <div style="font-size:15px; color:#E7EAEE;">This credential is proudly awarded to</div>
          <div style="font-size:36px; font-weight:800; color:#E7EAEE; margin:15px 0 10px; font-family:'Inter',sans-serif;">Alex Chen</div>
          <div style="font-size:14px; color:#8B95A5;">for successfully demonstrating hands-on technical mastery of</div>
          <div style="font-size:24px; font-weight:700; color:#E8A33D; margin-top:15px; font-family:'JetBrains Mono',monospace;">Beginner Cloud Security Practitioner Certificate</div>
        </div>

        <div style="text-align:center; margin-top:40px; font-size:13px; color:#8B95A5; font-family:'JetBrains Mono',monospace;">
          Issued on March 15, 2026   |   Exam Score Achieved: 96.5%   |   Grade: Distinction
        </div>

        <div style="position:absolute; bottom:35px; left:50px; font-family:'JetBrains Mono',monospace; font-size:11px;">
          <div style="color:#4FB6A8; font-weight:700;">VERIFICATION ID: CSL-2026-BGN-98F2A10B</div>
          <div style="color:#8B95A5; font-size:10px; margin-top:4px;">Verify authenticity online: https://cloudseclab.io/verify/CSL-2026-BGN-98F2A10B</div>
        </div>

        <div style="position:absolute; bottom:30px; right:50px; background:#fff; padding:6px; border-radius:6px;">
          <svg width="70" height="70" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="#fff"/>
            <rect x="10" y="10" width="30" height="30" fill="#000"/>
            <rect x="60" y="10" width="30" height="30" fill="#000"/>
            <rect x="10" y="60" width="30" height="30" fill="#000"/>
            <rect x="18" y="18" width="14" height="14" fill="#fff"/>
            <rect x="68" y="18" width="14" height="14" fill="#fff"/>
            <rect x="18" y="68" width="14" height="14" fill="#fff"/>
            <rect x="50" y="50" width="15" height="15" fill="#000"/>
            <rect x="75" y="75" width="15" height="15" fill="#000"/>
            <rect x="50" y="75" width="10" height="10" fill="#000"/>
          </svg>
        </div>
      </div>
    `;
  });
  await sleep(300);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'certificate_pdf_sample.png') });

  await browser.close();
  console.log('ALL SCREENSHOTS CAPTURED SUCCESSFULLY!');
}

run().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
