const axios = require('axios');
const fs = require('fs');

const urls = [
    'https://simienethiopiatours.com/',
    'https://ethiotravelandtours.com/',
    'https://www.addisababatour.com/',
    'https://www.walkinethiopia.com/',
    'https://afroethiopiatour.com/',
    'https://abealtebeb.com/home',
    'https://balemountains.org/',
    'https://ethiotours.travel/danakil-depression-tours',
    'https://whc.unesco.org/en/list/18/'
];

async function run() {
    const results = {};
    for (const u of urls) {
        try {
            const res = await axios.get(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, timeout: 10000 });
            const match = res.data.match(/<meta\\s+(?:[^>]*?\\s+)??property=[\"\\']og:image[\"\\']\\s+content=[\"\\']([^>]+?)[\"\\']/i) ||
                res.data.match(/<meta\\s+(?:[^>]*?\\s+)??content=[\"\\']([^>]+?)[\"\\']\\s+property=[\"\\']og:image[\"\\']/i);
            results[u] = match ? match[1] : 'NOT_FOUND';
        } catch (e) {
            results[u] = 'ERROR: ' + e.message;
        }
    }
    fs.writeFileSync('tmp/og.json', JSON.stringify(results, null, 2), 'utf8');
}

run();
