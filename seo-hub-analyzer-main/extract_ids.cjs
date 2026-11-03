const fs = require('fs');
const svg = fs.readFileSync('public/seo-hero-illustration.svg', 'utf8');
const ids = new Set();
const regex = /id="([^"]+)"/g;
let match;
while ((match = regex.exec(svg)) !== null) {
  ids.add(match[1]);
}
console.log(Array.from(ids));
