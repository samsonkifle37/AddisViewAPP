const fs = require('fs');
const lines = fs.readFileSync('H:/AddisView/tmp/migration_final.txt', 'utf8').split('\n');
const last = lines.slice(-80);
console.log(last.join('\n'));
