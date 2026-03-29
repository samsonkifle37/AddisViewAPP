const fs = require('fs');
const content = fs.readFileSync('H:/AddisView/tmp/migration_final.txt', 'utf8');
const matches = content.match(/Run again to continue/g) || [];
console.log('Batches completed:', matches.length);
const photoMatches = content.match(/Photos saved:\s+(\d+)/g) || [];
let totalPhotos = 0;
photoMatches.forEach(m => { totalPhotos += parseInt(m.match(/\d+/)[0]); });
console.log('Photos in this run:', totalPhotos);
