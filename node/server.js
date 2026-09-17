const express = require('express');
const path = require('path');
const { readJson, writeJson, findById, updateJson } = require('./jsonStore');
const config = require('./config');
const { scanGroups } = require('./scanner');
const { preparePromotion, validateBeforePublish } = require('./publisher');
const { analyzePost, generateReply } = require('./pythonClient');
const { getScheduledSlots } = require('./scheduler');

const app = express();
const port = config.port;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

function withError(res, message, status = 500) {
  return res.status(status).json({ success: false, message });
}

app.get('/', (req, res) => {
  const postsData = readJson('posts.json');
  const configData = readJson('config.json');
  const historyData = readJson('history.json');
  const groupsData = readJson('groups.json');

  const posts = Array.isArray(postsData.posts) ? postsData.posts : [];
  const actions = Array.isArray(historyData.actions) ? historyData.actions : [];
  const groups = Array.isArray(groupsData.groups) ? groupsData.groups : [];

  const summary = {
    totalPosts: posts.length,
    veryRelevant: posts.filter((p) => p.score >= 90).length,
    pendingReplies: posts.filter((p) => p.status === 'new').length,
    scheduled: configData.scheduler?.slots?.length || 3,
    recentActions: actions.slice(0, 5),
  };

  res.render('index', {
    summary,
    posts,
    groups,
    config: configData,
  });
});

app.get('/posts', (req, res) => {
  const postsData = readJson('posts.json');
  res.json({ posts: postsData.posts || [] });
});

app.get('/settings', (req, res) => {
  const configData = readJson('config.json');
  const groupsData = readJson('groups.json');
  res.render('settings', { config: configData, groups: groupsData.groups || [] });
});

app.get('/scheduler', (req, res) => {
  const configData = readJson('config.json');
  res.render('scheduler', { config: configData, slots: getScheduledSlots() });
});

app.post('/api/scan', async (req, res) => {
  try {
    const results = await scanGroups();
    res.json({ success: true, count: results.length, posts: results });
  } catch (error) {
    withError(res, error.message, 500);
  }
});

app.post('/api/analyze', async (req, res) => {
  const { text } = req.body || {};
  if (!text || String(text).trim().length < 5) {
    return withError(res, 'Texte insuffisant pour analyser.', 400);
  }

  try {
    const analysis = await analyzePost(String(text));
    res.json({ success: true, analysis });
  } catch (error) {
    withError(res, `Erreur Python: ${error.message}`, 500);
  }
});

app.post('/api/generate-reply', async (req, res) => {
  const { postId } = req.body || {};
  const postsData = readJson('posts.json');
  const post = (postsData.posts || []).find((item) => item.id === postId);

  if (!post) {
    return withError(res, 'Post introuvable.', 404);
  }

  try {
    const output = await generateReply(post);
    const repliesData = readJson('replies.json');
    const list = Array.isArray(repliesData.replies) ? repliesData.replies : [];

    list.push({
      id: `reply_${Date.now()}`,
      postId: post.id,
      text: output.reply,
      createdAt: new Date().toISOString(),
    });

    writeJson('replies.json', { replies: list });
    res.json({ success: true, reply: output.reply });
  } catch (error) {
    withError(res, `Erreur generation: ${error.message}`, 500);
  }
});

app.post('/api/publish', (req, res) => {
  const { postId } = req.body || {};
  if (!postId) {
    return withError(res, 'Identifiant manquant.', 400);
  }

  const postsData = readJson('posts.json');
  const post = (postsData.posts || []).find((item) => item.id === postId);

  if (!post) {
    return withError(res, 'Post introuvable.', 404);
  }

  const historyData = readJson('history.json');
  const list = Array.isArray(historyData.actions) ? historyData.actions : [];
  list.unshift({
    id: `action_${Date.now()}`,
    type: 'comment',
    postId: post.id,
    groupId: post.groupId,
    timestamp: new Date().toISOString(),
    status: 'published',
  });
  writeJson('history.json', { actions: list });

  post.status = 'replied';
  writeJson('posts.json', { posts: postsData.posts || [] });
  res.json({ success: true, message: 'Publication validée et enregistrée.' });
});

app.post('/api/promotion', (req, res) => {
  const { text } = req.body || {};
  const promo = preparePromotion();
  const safeText = text || promo.text;

  if (!validateBeforePublish({ text: safeText })) {
    return withError(res, 'Texte de promotion invalide.', 400);
  }

  res.json({ success: true, publication: { ...promo, text: safeText } });
});

app.post('/api/settings', (req, res) => {
  const { scanInterval, scheduler, globalStop } = req.body || {};
  const configData = readJson('config.json');

  if (scanInterval) {
    configData.scanInterval = Number(scanInterval);
  }
  if (scheduler) {
    configData.scheduler = scheduler;
  }
  if (typeof globalStop !== 'undefined') {
    configData.globalStop = Boolean(globalStop);
  }

  writeJson('config.json', configData);
  res.json({ success: true, config: configData });
});

app.post('/api/groups', (req, res) => {
  const { group } = req.body || {};
  if (!group || !group.name || !group.url) {
    return withError(res, 'Données de groupe incomplètes.', 400);
  }

  const groupsData = readJson('groups.json');
  const list = Array.isArray(groupsData.groups) ? groupsData.groups : [];

  list.push({
    id: `group_${Date.now()}`,
    name: group.name,
    url: group.url,
    enabled: group.enabled !== false,
    allowPromotion: group.allowPromotion !== false,
  });

  writeJson('groups.json', { groups: list });
  res.json({ success: true, groups: list });
});

app.post('/api/stop', (req, res) => {
  const configData = readJson('config.json');
  configData.globalStop = true;
  writeJson('config.json', configData);
  res.json({ success: true, message: 'STOP GLOBAL activé.' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
