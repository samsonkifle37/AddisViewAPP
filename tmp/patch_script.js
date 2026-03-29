const fs = require('fs');
let content = fs.readFileSync('scripts/migrate-images-google-places.js', 'utf8');

const CURSOR_FILE = 'tmp/migration_cursor.json';

const newFn = `
// ─── Get Places Needing Images ────────────────────────────────────────────────
async function getPlacesNeedingImages() {
  // Cursor-based pagination: track last processed place ID to avoid URL-length limits
  const CURSOR_FILE = 'tmp/migration_cursor.json';
  let cursorId = '';
  if (fs.existsSync(CURSOR_FILE)) {
    try { cursorId = JSON.parse(fs.readFileSync(CURSOR_FILE, 'utf8')).lastId || ''; } catch {}
  }

  // Query next batch of places after cursor (ordered by id)
  let query = supabase
    .from('Place')
    .select('id, name, latitude, longitude, city, type, slug')
    .eq('isActive', true)
    .eq('status', 'APPROVED')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .order('id', { ascending: true })
    .limit(BATCH_SIZE * 4); // overfetch to skip already-done ones in memory

  if (cursorId) {
    query = query.gt('id', cursorId);
  }

  const { data: places, error: e2 } = await query;
  if (e2) throw e2;

  if (!places || places.length === 0) {
    // Reached end — reset cursor for next full pass
    fs.writeFileSync(CURSOR_FILE, JSON.stringify({ lastId: '' }));
    console.log('\\n📋  Reached end of places list — resetting cursor');
    return [];
  }

  // In-memory filter: skip places already having google_places images
  const { data: done } = await supabase
    .from('PlaceImage')
    .select('placeId')
    .eq('imageSource', 'google_places')
    .in('placeId', places.map(p => p.id));
  
  const doneSet = new Set((done || []).map(r => r.placeId));
  
  // Load attempted (no-photos) list
  let attempted = [];
  if (fs.existsSync(ATTEMPTED_FILE)) {
    try { attempted = JSON.parse(fs.readFileSync(ATTEMPTED_FILE, 'utf8')); } catch {}
  }
  const attemptedSet = new Set(attempted);

  const filtered = places.filter(p => !doneSet.has(p.id) && !attemptedSet.has(p.id))
    .slice(0, BATCH_SIZE);

  // Advance cursor to last place in fetched batch (not filtered — advance by raw fetch)
  const lastId = places[places.length - 1].id;
  fs.writeFileSync(CURSOR_FILE, JSON.stringify({ lastId }));

  console.log(\`\\n📋  Found \${filtered.length} places needing images (cursor: \${cursorId ? cursorId.slice(0,8) + '...' : 'start'})\`);
  return filtered;
}
`;

// Find and replace the function
const startMarker = '// ─── Get Places Needing Images ────────────────────────────────────────────────';
const endMarker = '// ─── Google Places API (New) ────────────────────────────────────────────────────';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Could not find function markers. startIdx:', startIdx, 'endIdx:', endIdx);
  process.exit(1);
}

content = content.slice(0, startIdx) + newFn + '\n' + content.slice(endIdx);
fs.writeFileSync('scripts/migrate-images-google-places.js', content);
console.log('Script patched successfully!');
console.log('New function length:', newFn.length, 'chars');
