const fs = require('fs');
const path = require('path');

const batchFiles = [
    'sourced_images_batch_1_2.json',
    'sourced_images_batch_2.json',
    'sourced_images_batch_3_10.json',
    'sourced_images_batch_last.json'
];

let allItems = [];
const seenIds = new Set();

batchFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        items.forEach(item => {
            if (!seenIds.has(item.id)) {
                allItems.push(item);
                seenIds.add(item.id);
            }
        });
    }
});

fs.writeFileSync(path.join(__dirname, 'sourced_images_final.json'), JSON.stringify(allItems, null, 2));
console.log(`Merged ${allItems.length} unique items into sourced_images_final.json`);
