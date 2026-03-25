const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844 }); // Mobile viewport

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: 'tmp/homepage_nu.png', fullPage: false });

  await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle0' });
  // Click "Sign In" button to open modal
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const signin = btns.find(b => b.textContent && b.textContent.includes('Sign In'));
    if(signin) signin.click();
  });
  await new Promise(r => setTimeout(r, 1000)); // wait for modal animation
  await page.screenshot({ path: 'tmp/profile_nu.png', fullPage: false });

  await browser.close();
  console.log('Screenshots saved');
})();
