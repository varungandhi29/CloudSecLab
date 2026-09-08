const path = require('path');
const puppeteer = require(path.resolve(__dirname, '../frontend/node_modules/puppeteer-core'));

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_DIR = path.resolve(__dirname, '../output/screenshots');
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhbGV4X2NoZW4iLCJ1c2VyX2lkIjoiNGJhYzQ1ZjgtMzFmNC00MWFhLWFjYmEtZmJjMWU3MjhmZDVkIiwiZXhwIjoxNzg4ODUwMjYzLCJ0eXBlIjoiYWNjZXNzIn0.oK5mBGoAMrfSA3bZBx5KaiedQ0_VvmFBtV-deF05h2s';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--hide-scrollbars'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 850, deviceScaleFactor: 2 });

  await page.goto('http://127.0.0.1:3000/dashboard', { waitUntil: 'networkidle0' });
  await page.evaluate((tok) => {
    localStorage.setItem('token', tok);
    localStorage.removeItem('cloudseclab_onboarding_completed');
  }, TOKEN);

  await page.goto('http://127.0.0.1:3000/dashboard', { waitUntil: 'networkidle0' });
  await sleep(600);

  // Capture step 1
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05_onboarding_step1.png') });
  console.log('Captured 05_onboarding_step1.png');

  for (let step = 2; step <= 4; step++) {
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const nextBtn = btns.find((b) => b.textContent && (b.textContent.includes('Next') || b.textContent.includes('Get Started')));
      if (nextBtn) nextBtn.click();
    });

    await sleep(400);
    const filename = `0${4 + step}_onboarding_step${step}.png`;
    await page.screenshot({ path: path.join(OUTPUT_DIR, filename) });
    console.log('Captured', filename);
  }

  await browser.close();
  console.log('All 4 onboarding steps captured!');
}

run().catch(console.error);
