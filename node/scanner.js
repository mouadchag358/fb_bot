const { openGroup } = require('./facebook');
const { analyzePost } = require('./pythonClient');
const { readJson, writeJson, updateJson } = require('./jsonStore');

const CLEANUP = /\s+/g;

function cleanText(text = '') {
  return String(text || '').replace(/<[^>]*>/g, ' ').replace(CLEANUP, ' ').trim();
}

function uniquePostKey(post) {
  return post.url || post.text || `${Date.now()}-${Math.random()}`;
}

async function scanGroups() {
  const groupsData = readJson('groups.json');
  const postsData = readJson('posts.json');
  const allPosts = Array.isArray(postsData.posts) ? postsData.posts : [];
  const seenUrls = new Set(allPosts.map((p) => p.url));

  const results = [];

  for (const group of groupsData.groups || []) {
    if (!group.enabled) continue;

    try {
      const { browser, page } = await openGroup(group.url);
      const postCards = await page.locator('div[data-pagelet="FeedUnit_0"').count();
      console.log(`Group ${group.name}: posts visible ~ ${postCards}`);

      const feedBlocks = page.locator('div[data-pagelet="FeedUnit_0"');
      const count = await feedBlocks.count();

      for (let i = 0; i < count; i += 1) {
        const block = feedBlocks.nth(i);
        const text = await block.locator('div').first().textContent().catch(() => '');
        const cleaned = cleanText(text);

        if (!cleaned || cleaned.length < 18) continue;

        const detail = {
          id: `post_${Date.now()}_${i}`,
          groupId: group.id,
          groupName: group.name,
          url: group.url,
          author: 'unknown',
          text: cleaned,
          language: 'en',
          score: 0,
          category: 'other',
          detectedAt: new Date().toISOString(),
          status: 'new',
        };

        if (seenUrls.has(detail.url)) continue;

        const analysis = await analyzePost(cleaned);
        detail.language = analysis.language || 'en';
        detail.category = analysis.category || 'other';
        detail.score = Number(analysis.score || 0);
        detail.intent = analysis.intent || 'unknown';
        detail.reason = analysis.reason || '';

        if (detail.score >= 50) {
          allPosts.unshift(detail);
          seenUrls.add(detail.url);
          results.push(detail);
        }
      }

      await browser.close();
    } catch (error) {
      console.error(`Scan error for group ${group.name}: ${error.message}`);
    }
  }

  if (results.length) {
    writeJson('posts.json', { posts: allPosts });
  }

  return results;
}

module.exports = { scanGroups, cleanText };
