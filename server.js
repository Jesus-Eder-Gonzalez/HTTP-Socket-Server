'use strict';

const net = require('net');
const rl = require('readline');
const content = require('./serverContent');
const moment = require('moment-timezone');

const screen = process.stdout;
const httpServer = net.createServer();
const version = `HTTP/1.1`;
const server = `Generic HTTP Server`;

let contentLength = {};
const contentKeys = Object.keys(content);

contentKeys.forEach(key => {
  contentLength[key] = getByteSize(content[key]);
});

let request = '';
let response = '';
let status = '';
let size = '';
let body = '';

httpServer.listen(8080, '0.0.0.0', () => screen.write('Server listening on 0.0.0.0:8080\n'));

httpServer.on('connection', (socket) => {
  screen.write('\nCONNECTION ESTABLISHED\n');
  socket.setDefaultEncoding('UTF8')
  socket.on('data', (data) => {
    screen.write(data);
    request = data.toString().split('\r\n');
    knownMethods(request[0].split(' '));
    screen.write(response.split(['\r\n'])[0]);
    socket.end(response);
  });
});

function knownMethods(requestStr) {
  let method = requestStr[0];
  let path = requestStr[1];

  path = `${(path === '/') ? `/index.html` :
   (path === '') ? `/index.html` :
    `${path}`}`;

  if (content[path]) {
    status = `200 OK`;
    size = contentLength[path];
  } else {
    status = `404 Not Found`;
    size = '';
    path = '/404.html';
  }

  switch (method) {
    case 'HEAD':
      body = '\n';
      break;
    case 'GET':
      body = content[path] + '\n';
      break;
  }

  buildResponse();
}

function buildResponse() {
  response = `${version} ${status}\r\n`;
  response += `${size ? `Content-Length: ${size}\r\n` : ''}`;
  response += `Date: ${moment().tz('GMT').format('DD MMM YYYY hh:mm:ss zz')}\r\nContent-Type: text/html; charset=UTF8\r\nServer: ${server}\r\n\r\n`;
  response += `${body}`
}

function getByteSize(str) {
  str = String(str);
  let byteLen = 0;
  for (let i = 0; i < str.length; i++) {
    let c = str.charCodeAt(i);
    byteLen += c < (1 << 7) ? 1 :
      c < (1 << 11) ? 2 :
        c < (1 << 16) ? 3 :
          c < (1 << 21) ? 4 :
            c < (1 << 26) ? 5 :
              c < (1 << 31) ? 6 : Number.Nan;
  }
  return byteLen;
}

// POST /apply HTTP/1.1
// Host: www.devleague.com
// Connection: Keep-Alive
// Accept: text/html, application/json
// Content-Length: 278


// HTTP/1.1 200 OK
// HTTP/1.0 404 Not Found
// HTTP/1.1 403 Forbidden
// HTTP/1.1 500 Internal Server Error
// HTTP/1.1 302 Found
// HTTP/1.1 304 Not Modified
