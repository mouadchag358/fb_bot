require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const state = {
  port: Number(process.env.PORT || 3000),
  pythonUrl: process.env.PYTHON_URL || 'http://127.0.0.1:8000',
  scanInterval: Number(process.env.SCAN_INTERVAL || 30),
  browserDataDir: require('path').join(__dirname, '..', 'browser-data'),
  logDir: require('path').join(__dirname, '..', 'logs'),
  globalStop: false,
};

module.exports = state;
