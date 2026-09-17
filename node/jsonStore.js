const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJson(fileName) {
  ensureDir();
  const filePath = path.join(DATA_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (!raw.trim()) return [];
    return JSON.parse(raw);
  } catch (error) {
    throw new Error(`Impossible de lire ${fileName}: ${error.message}`);
  }
}

function writeJson(fileName, data) {
  ensureDir();
  const filePath = path.join(DATA_DIR, fileName);

  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(filePath, json, 'utf-8');
}

function updateJson(fileName, updater) {
  const current = readJson(fileName);
  const next = updater(current);
  writeJson(fileName, next);
  return next;
}

function appendJson(fileName, item) {
  return updateJson(fileName, (current) => {
    const collectionKey = Object.keys(current)[0] || 'items';
    const collection = Array.isArray(current[collectionKey]) ? current[collectionKey] : [];

    const nextItem = { ...item };
    if (!nextItem.id) {
      nextItem.id = `${collectionKey}_${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
    }

    collection.push(nextItem);
    return { ...current, [collectionKey]: collection };
  });
}

function findById(fileName, id, keyName = 'id') {
  const data = readJson(fileName);
  const collectionKey = Object.keys(data)[0] || 'items';
  const collection = Array.isArray(data[collectionKey]) ? data[collectionKey] : [];
  return collection.find((item) => item[keyName] === id) || null;
}

module.exports = {
  readJson,
  writeJson,
  updateJson,
  appendJson,
  findById,
};
