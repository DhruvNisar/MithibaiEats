const fs = require('fs');
const path = require('path');

const seedDir = path.join(__dirname, '..', 'src', 'seed', 'seedData');
fs.mkdirSync(seedDir, { recursive: true });

console.log('Seed directory ready at:', seedDir);
