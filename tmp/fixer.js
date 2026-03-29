const fs = require('fs');
let c = fs.readFileSync('scripts/migrate-images-google-places.js', 'utf8');
const lines = c.split('\n');
// Fix lines 103-104 which are broken: console.log split across two lines
// Line 103 (index 102): '    console.log("'
// Line 104 (index 103): ' All places scanned - cursor reset");'
if (lines[102].trim() === 'console.log("' || lines[102].includes('console.log("') && !lines[102].includes(');')) {
  lines[102] = lines[102].replace('console.log("', 'console.log("').trimEnd();
  // If next line has the rest, merge them
  lines.splice(102, 2, '    console.log("All places scanned - cursor reset");');
  console.log('Fixed console.log at line 103');
}

// Fix Found console.log similarly
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('console.log("') && !lines[i].includes(');') && !lines[i].includes('//')) {
    if (i + 1 < lines.length && lines[i+1].includes(');')) {
      const merged = lines[i].trimEnd() + lines[i+1].trim();
      lines.splice(i, 2, merged.replace(/\s+/, ' '));
      console.log('Merged line', i+1);
    }
  }
}

fs.writeFileSync('scripts/migrate-images-google-places.js', lines.join('\n'));
console.log('Done');
