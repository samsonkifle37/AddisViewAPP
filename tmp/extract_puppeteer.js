const puppeteer = require('puppeteer');

const sources = [
    { id: 'Simien Eco Tours', url: 'https://simienethiopiatours.com/' },
    { id: 'Ethio Travel and Tours', url: 'https://ethiotravelandtours.com/' },
    { id: 'Green Land Tours Ethiopia', url: 'https://www.getyourguide.com/-t1209589' },
    { id: 'Addis Nightlife Tour', url: 'https://www.addisababatour.com/' },
    { id: 'Historical Addis Walking Tour', url: 'https://www.walkinethiopia.com/' },
    { id: 'Entoto Mountain Tour', url: 'https://www.google.com/maps/place/Entoto+Park+-+Main+Entrance/@9.056522,38.7728355,12z/data=!4m10!1m2!2m1!1sEntoto+Mountain+Tour+Addis+Ababa+Ethiopia!3m6!1s0x164b8fef0faf8059:0xd099ff76915c4d12!8m2!3d9.0865736!4d38.7624696' },
    { id: 'Addis Food Tour', url: 'https://afroethiopiatour.com/' },
    { id: 'Merkato Market Tour', url: 'https://www.google.com/maps/place/%E1%89%86%E1%8C%AA+%E1%8C%88%E1%89%A0%E1%8B%AB+%7C+kochigebya/@9.0101268,38.7032184,37818m/data=!3m1!1e3!4m10!1m2!2m1!1sMerkato+Market+Tour+Addis+Ababa+Ethiopia!3m6!1s0x164b87c493608a15:0xa42be128aaa90995!8m2!3d9.0333663!4d38.7352302' },
    { id: 'Alem Bunna', url: 'https://www.google.com/maps/place/Alem+Bunna+%7C+Wollo+Sefer+%7C+%E1%8A%A0%E1%88%88%E1%88%9D+%E1%89%A1%E1%8A%93+%7C+%E1%8B%88%E1%88%8E+%E1%88%B0%E1%8D%88%E1%88%AD/@8.9949697,38.7739684,1182m/data=!3m2!1e3!4b1!4m6!3m5!1s0x164b84549c4f8e43:0xcdcc219d223a866!8m2!3d8.9949697!4d38.7739684' },
    { id: 'Garden of Coffee', url: 'https://www.google.com/maps/place/Galani+Coffee/@9.000324,38.8001973,18909m/data=!3m1!1e3!4m10!1m2!2m1!1sGarden+of+Coffee+Addis+Ababa+Ethiopia!3m6!1s0x164b8534dc0d0707:0x1e4b976f4fab0c4e!8m2!3d9.0068028!4d38.8177877' },
    { id: 'Atikilt Tera vegetable market', url: 'https://www.google.com/maps/place/Addis+Fruit+%26+Vegetable+Market+Center/@8.9948571,38.8138297,3a,75y/data=!3m8!1e2!3m6!1sCIHM0ogKEICAgIDW9cWw0gE!2e10!3e12!6shttps:%2F%2Flh3.googleusercontent.com%2Fgps-cs-s%2FAHVAweowuPOp_QMWdFqOADSZKVo27L5-kY9NIjp257lSRMLgqK3uj8q2jn9EiW-LH-YuCL411u9yFhMTKmqrFFr8iphIHNhh1F_5KxoXchlS98m_SR2Z4UXUorBzJ1lkkp9c0T74s3lT2w%3Dw203-h360-k-no' },
    { id: 'Sabon Tera Market', url: 'https://abealtebeb.com/home' },
    { id: 'Entoto Natural Park', url: 'https://www.google.com/maps/place/%E1%8B%A8%E1%8A%A5%E1%8A%95%E1%8C%A6%E1%8C%A6+%E1%8B%A8%E1%89%B0%E1%8D%88%E1%8C%A5%E1%88%AE+%E1%8D%93%E1%88%AD%E1%8A%AD+(%E1%88%98%E1%8A%95%E1%8A%A8%E1%89%A3%E1%8A%A8%E1%89%A2%E1%8B%AB)+%7C+Entoto+Natural+Park+(Nursery)/@9.0932548,38.7705466,2363m/data=!3m1!1e3!4m10!1m2!2m1!1sEntoto+Natural+Park+Addis+Ababa+Ethiopia!3m6!1s0x164b8e7e0fb5b8c3:0x921cef3fbcf8fff6!8m2!3d9.0999361!4d38.7794983' },
    { id: 'Mount Entoto viewpoint', url: 'https://www.google.com/maps/place/Mount+Entoto/@9.0982705,38.772222,9452m/data=!3m1!1e3!4m10!1m2!2m1!1sMount+Entoto+viewpoint+Addis+Ababa+Ethiopia!3m6!1s0x164b8c3197f47115:0xca30c3e98e23bd6e!8m2!3d9.115556!4d38.772222' },
    { id: 'Ethnological Museum', url: 'https://www.google.com/maps/search/?api=1&query=Ethnological%20Museum%20(Addis%20Ababa%20University)%20Addis%20Ababa%20Ethiopia' },
    { id: 'Bale Mountains National Park', url: 'https://balemountains.org/' },
    { id: 'Danakil Depression Tour', url: 'https://ethiotours.travel/danakil-depression-tours' },
    { id: 'Rock-Hewn Churches of Lalibela', url: 'https://whc.unesco.org/en/list/18/' }
];

async function run() {
    const browser = await puppeteer.launch({ headless: 'new' });
    const results = {};

    for (const item of sources) {
        try {
            console.log(`Checking ${item.id}...`);
            const page = await browser.newPage();
            await page.goto(item.url, { waitUntil: 'domcontentloaded', timeout: 15000 });

            let imgUrl = null;

            if (item.url.includes('google.com/maps')) {
                // Look for typical Google Maps photo imagery
                try {
                    await page.waitForSelector('meta[itemprop="image"]', { timeout: 3000 });
                    imgUrl = await page.$eval('meta[itemprop="image"]', el => el.content);
                } catch (e) {
                    // Alternative map image lookup
                    imgUrl = await page.evaluate(() => {
                        const m = document.querySelector('meta[property="og:image"]');
                        if (m && m.content) return m.content;
                        const buttons = Array.from(document.querySelectorAll('button[aria-label*="Photo"]'));
                        if (buttons.length > 0) {
                            const bgMatch = buttons[0].style.backgroundImage.match(/url\\(["']?(.*?)["']?\\)/);
                            if (bgMatch) return bgMatch[1].replace(/=w.*/, '=w1920-h1080-k-no');
                        }
                        const imgs = Array.from(document.querySelectorAll('img')).map(i => i.src).filter(s => s && s.includes('lh3.googleusercontent.com'));
                        return imgs.length > 0 ? imgs[0].replace(/=w.*/, '=w1920-h1080-k-no') : null;
                    });
                }
            } else {
                // Basic web sites
                imgUrl = await page.evaluate(() => {
                    const og = document.querySelector('meta[property="og:image"]');
                    if (og && og.content) return og.content;

                    const tw = document.querySelector('meta[name="twitter:image"]');
                    if (tw && tw.content) return tw.content;

                    // Largest hero-ish image
                    const imgs = Array.from(document.querySelectorAll('img'))
                        .filter(img => img.width > 200 && img.height > 200 && img.src.includes('http'));

                    if (imgs.length > 0) return imgs[0].src;

                    // Background images?
                    const allEls = document.querySelectorAll('*');
                    for (let el of allEls) {
                        const bg = window.getComputedStyle(el).backgroundImage;
                        if (bg !== 'none' && bg.includes('url')) {
                            const match = bg.match(/url\\(["']?(.*?)["']?\\)/);
                            if (match && match[2] && !!match[2].match(/^http/)) {
                                if (el.getBoundingClientRect().width > 300) return match[2];
                            }
                        }
                    }

                    return null;
                });
            }

            // Convert absolute urls if it's relative
            if (imgUrl && !imgUrl.startsWith('http')) {
                const urlObj = new URL(item.url);
                if (imgUrl.startsWith('//')) {
                    imgUrl = urlObj.protocol + imgUrl;
                } else if (imgUrl.startsWith('/')) {
                    imgUrl = urlObj.origin + imgUrl;
                } else {
                    imgUrl = urlObj.origin + '/' + imgUrl;
                }
            }

            results[item.id] = imgUrl || 'NOT_FOUND';
            await page.close();
        } catch (e) {
            console.log(`Failed ${item.id}:`, e.message);
            results[item.id] = 'ERROR: ' + e.message;
        }
    }

    await browser.close();
    const fs = require('fs');
    fs.writeFileSync('G:\\AddisView\\tmp\\images_extracted.json', JSON.stringify(results, null, 2));
    console.log('Extraction complete! Data saved to images_extracted.json');
}

run();
