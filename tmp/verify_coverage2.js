const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'H:/AddisView/.env.local' });
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function getAllPlaces() {
  let all = [], page = 0, PAGE = 1000;
  while (true) {
    const { data } = await s.from('Place').select('id,name,type,status').range(page*PAGE,(page+1)*PAGE-1);
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE) break;
    page++;
  }
  return all;
}

async function getCoveredIds() {
  const ids = new Set();
  let page = 0, PAGE = 1000;
  while (true) {
    const { data } = await s.from('PlaceImage').select('placeId').range(page*PAGE,(page+1)*PAGE-1);
    if (!data || data.length === 0) break;
    data.forEach(r => ids.add(r.placeId));
    if (data.length < PAGE) break;
    page++;
  }
  return ids;
}

(async () => {
  const [places, coveredIds] = await Promise.all([getAllPlaces(), getCoveredIds()]);
  const approved = places.filter(p => p.status === 'APPROVED');
  console.log('Total APPROVED places:', approved.length);
  console.log('Places with images:', coveredIds.size);
  const noImages = approved.filter(p => !coveredIds.has(p.id));
  console.log('APPROVED places with NO images:', noImages.length);
  if (noImages.length > 0) {
    noImages.slice(0,30).forEach(p => console.log(' -', p.name, `(${p.type})`));
    if (noImages.length > 30) console.log('  ...and', noImages.length - 30, 'more');
  }
})();
