const fs = require('fs');
const content = fs.readFileSync('H:/AddisView/tmp/migration_log4.txt', 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);
// Show first 20 and last 20 lines
console.log('\n--- FIRST 20 LINES ---');
lines.slice(0, 20).forEach(l => console.log(l));
console.log('\n--- LAST 20 LINES ---');
lines.slice(-20).forEach(l => console.log(l));
