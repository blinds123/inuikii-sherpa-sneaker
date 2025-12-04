const { chromium, devices } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    ...devices['iPhone 14'],
  });
  const page = await context.newPage();

  await page.goto('https://cozy-sherpa-sneakers.netlify.app');

  // Wait for page to load
  await page.waitForTimeout(2000);

  // Scroll to testimonials section
  await page.evaluate(() => {
    const testimonials = document.querySelector('.testimonials-section');
    if (testimonials) {
      testimonials.scrollIntoView({ behavior: 'instant' });
    }
  });

  // Wait for lazy images to load
  await page.waitForTimeout(1500);

  // Take screenshot of testimonials
  await page.screenshot({ path: 'testimonials-section.png' });

  await browser.close();
})();
