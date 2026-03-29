@echo off
:loop
echo [%TIME%] Starting batch...
C:\Users\samso\AppData\Local\pnpm\node.exe scripts/migrate-images-google-places.js >> tmp\migration_log.txt 2>&1
if errorlevel 1 (
    echo Script failed, stopping.
    goto end
)
echo [%TIME%] Batch complete. Checking if more places need images...
C:\Users\samso\AppData\Local\pnpm\node.exe -e "
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
async function check() {
  const { data: covered } = await sb.from('PlaceImage').select('placeId').eq('status', 'APPROVED');
  const ids = new Set((covered||[]).map(r=>r.placeId));
  const { data: places } = await sb.from('Place').select('id').eq('isActive',true).eq('status','APPROVED').not('latitude','is',null).not('longitude','is',null);
  const remaining = (places||[]).filter(p => !ids.has(p.id)).length;
  console.log('REMAINING:'+remaining);
  process.exit(remaining > 0 ? 0 : 99);
}
check().catch(e => { console.error(e); process.exit(99); });
" >> tmp\migration_log.txt 2>&1
if errorlevel 99 (
    echo ALL DONE! No more places need images.
    goto end
)
timeout /t 3 >nul
goto loop
:end
echo Loop finished.
