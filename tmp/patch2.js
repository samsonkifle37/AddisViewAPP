const fs = require("fs");
let c = fs.readFileSync("scripts/migrate-images-google-places.js", "utf8");
const startMark = "async function getPlacesNeedingImages()";
const endMark = "async function findGooglePlaceId(";
const si = c.indexOf(startMark);
const ei = c.indexOf(endMark);
console.log("si:", si, "ei:", ei);
const newFn = `async function getPlacesNeedingImages() {
  const CURSOR_FILE = "tmp/migration_cursor.json";
  let cursorId = "";
  if (fs.existsSync(CURSOR_FILE)) {
    try { cursorId = JSON.parse(fs.readFileSync(CURSOR_FILE, "utf8")).lastId || ""; } catch(e) {}
  }
  let query = supabase
    .from("Place")
    .select("id, name, latitude, longitude, city, type, slug")
    .eq("isActive", true)
    .eq("status", "APPROVED")
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("id", { ascending: true })
    .limit(BATCH_SIZE * 4);
  if (cursorId) query = query.gt("id", cursorId);
  const { data: places, error: e2 } = await query;
  if (e2) throw e2;
  if (!places || places.length === 0) {
    fs.writeFileSync(CURSOR_FILE, JSON.stringify({ lastId: "" }));
    console.log("\n All places scanned - cursor reset");
    return [];
  }
  const placeIds = places.map(p => p.id);
  const doneSet = new Set();
  for (let i = 0; i < placeIds.length; i += 50) {
    const chunk = placeIds.slice(i, i + 50);
    const { data: done } = await supabase.from("PlaceImage").select("placeId").eq("imageSource", "google_places").in("placeId", chunk);
    (done || []).forEach(r => doneSet.add(r.placeId));
  }
  let attempted = [];
  if (fs.existsSync(ATTEMPTED_FILE)) {
    try { attempted = JSON.parse(fs.readFileSync(ATTEMPTED_FILE, "utf8")); } catch(e) {}
  }
  const attemptedSet = new Set(attempted);
  const filtered = places.filter(p => !doneSet.has(p.id) && !attemptedSet.has(p.id)).slice(0, BATCH_SIZE);
  const lastId = places[places.length - 1].id;
  fs.writeFileSync(CURSOR_FILE, JSON.stringify({ lastId }));
  console.log("\nFound " + filtered.length + " places (cursor: " + (cursorId ? cursorId.slice(0,8)+"..." : "start") + ", raw fetch: " + places.length + ")");
  return filtered;
}
`;
c = c.slice(0, si) + newFn + "\n" + c.slice(ei);
fs.writeFileSync("scripts/migrate-images-google-places.js", c);
console.log("Patched OK");
