const { readJson, writeJson } = require('./jsonStore');

function getScheduledSlots() {
  const config = readJson('config.json');
  return config.scheduler?.slots || ['09:00', '14:00', '19:00'];
}

function isWithinSlots(time) {
  const slots = getScheduledSlots();
  return slots.includes(time);
}

module.exports = {
  getScheduledSlots,
  isWithinSlots,
};
