const { createBrowser, ensureFacebookSession } = require('./browser');

async function openGroup(groupUrl) {
  const browser = await createBrowser();
  const page = await browser.newPage();

  try {
    await ensureFacebookSession(page);
    await page.goto(groupUrl, { waitUntil: 'networkidle', timeout: 60000 });
    return { browser, page };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

module.exports = {
  openGroup,
};
