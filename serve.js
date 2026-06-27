const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8731;
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

function serve(res, file) {
  fs.readFile(file, (err, data) => {
    if (err && err.code === 'EISDIR') return serve(res, path.join(file, 'index.html'));
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('404 Not Found');
      return;
    }
    const type = (MIME[path.extname(file)] || 'text/plain') + '; charset=utf-8';
    res.writeHead(200, {'Content-Type': type});
    res.end(data);
  });
}

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') url = '/app.dc.html';
  serve(res, path.join(__dirname, url));
}).listen(PORT, () => {
  console.log(`✓ V-Heritage server running at http://localhost:${PORT}`);
});
