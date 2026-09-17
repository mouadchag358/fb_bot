const { chromium } = require('playwright');
const path = require('path');
const config = require('./config');

const browserDataDir = config.browserDataDir;

async function createBrowser() {
  const browser = await chromium.launchPersistentContext(browserDataDir, {
    headless: false,
    viewport: { width: 1440, height: 1200 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  });

  return browser;
}

async function ensureFacebookSession(page) {
  await page.goto('https://www.facebook.com', { waitUntil: 'networkidle', timeout: 60000 });
}

module.exports = {
  createBrowser,
  ensureFacebookSession,
};
