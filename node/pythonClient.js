const http = require('http');
const { URL } = require('url');

async function requestJson(url, payload) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const body = JSON.stringify(payload);

    const req = http.request(
      {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
            return;
          }

          try {
            resolve(data ? JSON.parse(data) : {});
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${error.message}`));
          }
        });
      }
    );

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function analyzePost(text) {
  const url = process.env.PYTHON_URL || 'http://127.0.0.1:8000';
  return requestJson(`${url}/analyze`, { text });
}

async function generateReply(post) {
  const url = process.env.PYTHON_URL || 'http://127.0.0.1:8000';
  return requestJson(`${url}/generate-reply`, {
    text: post.text || '',
    language: post.language || 'en',
    category: post.category || 'other',
  });
}

module.exports = {
  analyzePost,
  generateReply,
};
