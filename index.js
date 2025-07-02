const https = require('https');
const http = require('http');
const fs = require('fs');
const { URL } = require('url');
const querystring = require('querystring');

function request(urlOrOpts, opts = {}) {
  return new Promise((resolve, reject) => {
    let parsedUrl, options;

    if (typeof urlOrOpts === 'string') {
      parsedUrl = new URL(urlOrOpts);
      options = { ...opts };
    } else {
      parsedUrl = {
        protocol: urlOrOpts.protocol || 'https:',
        hostname: urlOrOpts.hostname,
        pathname: urlOrOpts.path || '/',
        search: ''
      };
      options = { ...urlOrOpts };
    }

    const queryObj = options.query;
    if (queryObj && typeof queryObj === 'object') {
      const qs = querystring.stringify(queryObj);
      if (parsedUrl instanceof URL) {
        parsedUrl.search += (parsedUrl.search ? '&' : '?') + qs;
      } else {
        parsedUrl.search = '?' + qs;
      }
    }

    const isHttps = parsedUrl.protocol === 'https:';
    const {
      method = 'GET',
      headers = {},
      body = null,
      rejectUnauthorized = true,
      timeout = 10000,
      responseType = 'auto',
      onlyBody = false
    } = options;

    const agent = isHttps
      ? new https.Agent({ keepAlive: true, rejectUnauthorized })
      : new http.Agent({ keepAlive: true });

    let bodyData = null;
    if (body) {
      const isJson = headers['Content-Type']?.includes('application/json');
      bodyData = typeof body === 'object'
        ? (isJson ? JSON.stringify(body) : querystring.stringify(body))
        : body;
      if (!headers['Content-Length']) {
        headers['Content-Length'] = Buffer.byteLength(bodyData);
      }
    }

    const reqOptions = {
      method,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + (parsedUrl.search || ''),
      headers,
      timeout,
      agent
    };

    const reqModule = isHttps ? https : http;

    const req = reqModule.request(reqOptions, (res) => {
      let data = [];

      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const contentType = res.headers['content-type'] || '';
        const isJson = contentType.includes('application/json');
        const buffer = Buffer.concat(data);

        try {
          const result =
            responseType === 'buffer' ? buffer :
            isJson && responseType !== 'text' ? JSON.parse(buffer.toString()) :
            buffer.toString();

          if (onlyBody) return resolve(result);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: result
          });
        } catch (err) {
          if (onlyBody) return resolve(buffer.toString());
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: buffer.toString()
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (bodyData) req.write(bodyData);
    req.end();
  });
}

async function requestBodyOnly(urlOrOpts, opts) {
  return request(urlOrOpts, { ...opts, onlyBody: true });
}

function requestStream(urlOrOpts, opts = {}) {
  return new Promise((resolve, reject) => {
    let parsedUrl, options;

    if (typeof urlOrOpts === 'string') {
      parsedUrl = new URL(urlOrOpts);
      options = { ...opts };
    } else {
      parsedUrl = {
        protocol: urlOrOpts.protocol || 'https:',
        hostname: urlOrOpts.hostname,
        pathname: urlOrOpts.path || '/',
        search: ''
      };
      options = { ...urlOrOpts };
    }

    const queryObj = options.query;
    if (queryObj && typeof queryObj === 'object') {
      const qs = querystring.stringify(queryObj);
      if (parsedUrl instanceof URL) {
        parsedUrl.search += (parsedUrl.search ? '&' : '?') + qs;
      } else {
        parsedUrl.search = '?' + qs;
      }
    }

    const isHttps = parsedUrl.protocol === 'https:';
    const {
      method = 'GET',
      headers = {},
      rejectUnauthorized = true,
      timeout = 10000,
      outputFile
    } = options;

    const agent = isHttps
      ? new https.Agent({ keepAlive: true, rejectUnauthorized })
      : new http.Agent({ keepAlive: true });

    const reqOptions = {
      method,
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + (parsedUrl.search || ''),
      headers,
      timeout,
      agent
    };

    const reqModule = isHttps ? https : http;

    const req = reqModule.request(reqOptions, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        if (outputFile) {
          const fileStream = fs.createWriteStream(outputFile);
          res.pipe(fileStream);
          fileStream.on('finish', () => {
            resolve({ success: true, path: outputFile });
          });
          fileStream.on('error', reject);
        } else {
          resolve(res);
        }
      } else {
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

module.exports = {
  request,
  requestBodyOnly,
  requestStream
};
