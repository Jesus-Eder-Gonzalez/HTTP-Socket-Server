'use strict';

const net = require('net');
const rl = require('readline');
const content = require('./serverContent');
const moment = require('moment-timezone');

const screen = process.stdout;
const httpServer = net.createServer();
const version = `HTTP/1.1`;
const server = `Generic HTTP Server`;

const contentKeys = Object.keys(content);

let contentLength = {};
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
  screen.write('CONNECTED\n');
  socket.setDefaultEncoding('UTF8')
  socket.on('data', (data) => {
    screen.write(data);
    request = data.toString().split('\r\n');
    knownMethods(request[0].split(' '));
    screen.write(response);
    socket.end(response);
  });
});

function knownMethods(requestStr) {
  let method = requestStr[0];
  let path = pathParse(requestStr[1]);
  switch (method) {
    case 'HEAD':
      response += `${version} `;
      if (content[path]) {
        status = `200 OK`;
        size = contentLength[path];
        body = '\n';
        buildResponse();

      } else {
        status = `404 Not Found`;
        body = '\n';
        buildResponse();
      }
      break;
    case 'GET':
      response += `${version} `;
      if (content[path] || path==='/' || path==='') {
        status = `200 OK`;
        size = contentLength[path];
        body = knownPaths(path) + '\n';
        buildResponse();
      } else {
        status = `404 Not Found`;
        body = knownPaths(path) + '\n';
        buildResponse();
      }
      break;
  }
}

function buildResponse() {
  response = `${version} ${status}\r\n`;
  response += `Content-Length: ${size}\r\n`;
  response += `Date: ${moment().tz('GMT').format('DD MMM YYYY hh:mm:ss zz')}\r\nContent-Type: text/html; charset=UTF8\r\nServer: ${server}\r\n\r\n`;
  response += `${body}`
}

function pathParse(pathStr) {
  let length = pathStr.length;
  let containsBack = pathStr.includes('/');
  let containsDot = pathStr.includes('.');
  let dirCount = pathStr.match(/[/]/g).length;

  if (containsBack && containsDot) {
    return pathStr.replace(/[/.]/g, ' ').split(' ')[dirCount];
  } else if (containsBack && !containsDot) {
    return pathStr.split('/')[1];
  } else {
    return '';
  }
}

function knownPaths(path) {

  switch (path) {
    case '':
    return content.index;
    break;
    case '/':
      return content.index;
      break;
    case 'index':
      return content.index;
      break;
    case 'hydrogen':
      return content.hydrogen;
      break;
    case 'helium':
      return content.helium;
      break;
    case 'styles':
      return content.styles;
      break;
    default:
      return content.error;
  }
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

// HTTP/1.1 200 OK
// Date: Sat, 21 Jul 2018 02:37:27 GMT
// Expires: -1
// Cache-Control: private, max-age=0
// Content-Type: text/html; charset=ISO-8859-1
// P3P: CP="This is not a P3P policy! See g.co/p3phelp for more info."
// Server: gws
// X-XSS-Protection: 1; mode=block
// X-Frame-Options: SAMEORIGIN
// Set-Cookie: 1P_JAR=2018-07-21-02; expires=Mon, 20-Aug-2018 02:37:27 GMT; path=/; domain=.google.com
// Set-Cookie: NID=135=VmfGYaNo9dWLyW2CsOwmBB0Xrgqk2F-quOs8T9E3oLhnfwMBiZ3Z5AvJOoocjBMkMBu1WAkiGGeN2G4-NRQ7No8QhNLHb-dianGPyEPkUARc627gOixnG_sOo6fAhba-; expires=Sun, 20-Jan-2019 02:37:27 GMT; path=/; domain=.google.com; HttpOnly
// Transfer-Encoding: chunked
// Accept-Ranges: none
// Vary: Accept-Encoding







//date = 1*2DIGIT month 2*4DIGIT
// 20 Jan 1982
// dd mm yy hh:mm:ss: zzz
// [METHOD][Request URI][HTTP VERSION]
// GET /index.html HTTP/1.1

// Host: www.devleague.com
// Connection: Keep-Alive
// Accept: text/html, application/json
// Date: Wed, 8 Jul 2015 11:12:31 GMT

// POST /apply HTTP/1.1
// Host: www.devleague.com
// Connection: Keep-Alive
// Accept: text/html, application/json
// Content-Length: 278

//[HTTP Version] [HTTP Status Code] [Reason Phrase]

// HTTP/1.1 200 OK
// HTTP/1.0 404 Not Found
// HTTP/1.1 403 Forbidden
// HTTP/1.1 500 Internal Server Error
// HTTP/1.1 302 Found
// HTTP/1.1 304 Not Modified

// HTTP/1.1 200 OK
// Server: nginx/1.4.6 (Ubuntu)
// Date: Wed, 08 Jul 2015 22:31:15 GMT
// Content-Type: text/html; charset=utf-8
// Content-Length: 40489
// Connection: keep-alive
