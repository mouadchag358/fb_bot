const { readJson, writeJson } = require('./jsonStore');

function createPublicationVariant() {
  const config = readJson('config.json');
  const variants = config.promo?.variants || [
    'I make modern portfolio websites starting at $10. DM me if you need one.',
    'I build modern portfolio websites starting at $10. Send me a DM if you\'re interested.',
  ];

  const index = Math.floor(Math.random() * variants.length);
  return variants[index];
}

function preparePromotion() {
  const message = createPublicationVariant();
  const publication = {
    id: `promo_${Date.now()}`,
    text: message,
    createdAt: new Date().toISOString(),
    status: 'draft',
  };

  const data = readJson('publications.json');
  const list = Array.isArray(data.publications) ? data.publications : [];
  list.push(publication);
  writeJson('publications.json', { publications: list });

  return publication;
}

function validateBeforePublish(publication) {
  return Boolean(publication && publication.text && publication.text.length > 10);
}

module.exports = {
  preparePromotion,
  validateBeforePublish,
};
