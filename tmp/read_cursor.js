const fs = require('fs');
try {
  const cursor = JSON.parse(fs.readFileSync('H:/AddisView/tmp/migration_cursor.json', 'utf8'));
  console.log('Cursor:', JSON.stringify(cursor));
} catch(e) { console.log('No cursor:', e.message); }
try {
  const attempted = JSON.parse(fs.readFileSync('H:/AddisView/tmp/google_places_attempted.json', 'utf8'));
  console.log('Attempted (no photos):', attempted.length);
} catch(e) { console.log('No attempted file:', e.message); }
