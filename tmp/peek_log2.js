const fs = require('fs');
const content = fs.readFileSync('H:/AddisView/tmp/migration_log2.txt', 'utf8');
const lines = content.split('\n');
console.log('Total lines:', lines.length);
// Show all SUMMARY sections
const summaryIdx = [];
lines.forEach((l, i) => { if (l.includes('SUMMARY') || l.includes('Photos saved') || l.includes('Run again') || l.includes('All places')) summaryIdx.push(i); });
summaryIdx.forEach(i => console.log(lines[i]));
