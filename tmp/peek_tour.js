const fs = require('fs');
try {
  const c = fs.readFileSync('H:/AddisView/tmp/tour_migration.txt', 'utf8');
  const lines = c.split('\n');
  console.log('Lines:', lines.length);
  lines.slice(-30).forEach(l => console.log(l));
} catch(e) { console.log('Not ready yet:', e.message); }
