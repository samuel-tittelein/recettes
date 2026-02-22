const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = __dirname;

// ─── Routes ──────────────────────────────────────────────────────────────────
// Chaque entrée associe une URL à un fichier HTML.
// Pour ajouter une recette : copier une ligne et changer l'URL + le fichier.
const ROUTES = {
  '/':                    'index.html',
  '/chips-des-sables':    'pages/chips_des_sables.html',
  '/pain-condamne':       'pages/pain_condamne.html',
  '/raclette-au-kaki':    'pages/raclette_au_kaki.html',
  '/soupe-aux-orties':    'pages/soupe_aux_orties.html',
};
// ─────────────────────────────────────────────────────────────────────────────

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.webp': 'image/webp',
};

function sendFile(filePath, response) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (error, data) => {
    if (error) {
      response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Erreur interne du serveur.');
      return;
    }
    response.writeHead(200, { 'Content-Type': contentType });
    response.end(data);
  });
}

const server = http.createServer((request, response) => {
  const url = decodeURIComponent((request.url || '/').split('?')[0]);

  // 1. Cherche l'URL dans les routes déclarées
  if (ROUTES[url]) {
    const filePath = path.join(ROOT_DIR, ROUTES[url]);
    sendFile(filePath, response);
    return;
  }

  // 2. Sert les fichiers statiques (CSS, images…) tels quels
  const safePath = path.normalize(url).replace(/^([.]{2}[/\\])+/, '');
  const filePath = path.join(ROOT_DIR, safePath);

  if (!filePath.startsWith(ROOT_DIR)) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Accès interdit.');
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (!error && stats.isFile()) {
      sendFile(filePath, response);
      return;
    }
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Page non trouvée.');
  });
});

server.listen(PORT, () => {
  const routes = Object.keys(ROUTES).map(r => `  http://localhost:${PORT}${r}`).join('\n');
  console.log(`Serveur web lancé sur http://localhost:${PORT}\n\nRoutes disponibles :\n${routes}`);
});
