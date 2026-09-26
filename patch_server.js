import fs from 'fs';
let c = fs.readFileSync('src/server.js', 'utf8');
c = c.replace(/\/api\//g, '/api/v1/');
fs.writeFileSync('src/server.js', c);
console.log('Fixed API routes to /api/v1/');
