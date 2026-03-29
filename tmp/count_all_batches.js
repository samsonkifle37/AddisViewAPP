const fs = require('fs');
const files = ['migration_log.txt','migration_log2.txt','migration_log3.txt','migration_log4.txt','migration_final.txt'];
let totalBatches = 0;
let totalPhotos = 0;
for (const f of files) {
  try {
    const content = fs.readFileSync('H:/AddisView/tmp/' + f, 'utf8');
    const batches = (content.match(/Run again to continue/g) || []).length;
    const photoMatches = content.match(/Photos saved:\s+(\d+)/g) || [];
    let photos = 0;
    photoMatches.forEach(m => { photos += parseInt(m.match(/\d+/)[0]); });
    console.log(f + ': ' + batches + ' batches, ' + photos + ' photos saved');
    totalBatches += batches;
    totalPhotos += photos;
  } catch(e) { console.log(f + ': not found'); }
}
console.log('TOTAL: ' + totalBatches + ' batches, ' + totalPhotos + ' photos logged');
