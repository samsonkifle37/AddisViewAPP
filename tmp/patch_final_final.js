const fs = require('fs');

const finalFixes = [
    { name: "Hyatt Regency Addis Ababa", url: "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2019/02/20/0822/Hyatt-Regency-Addis-Ababa-P007-Recreational-Swimming-Pool.jpg/Hyatt-Regency-Addis-Ababa-P007-Recreational-Swimming-Pool.16x9.jpg?imwidth=1920" },
    { name: "Kategna Restaurant", url: "https://static.wixstatic.com/media/9e3191_d0aa3adddcba44ffbeb97947dd7b1e4a~mv2_d_6000_4000_s_4_2.jpg" },
    { name: "Dashen Traditional Restaurant", url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/15/4c/4f/aa/garden-terrace.jpg?w=1200&h=-1&s=1" },
    { name: "Yod Abyssinia", url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/02/df/80/restaurant.jpg?w=1200&h=-1&s=1" },
    { name: "Marriott Executive Apartments Addis Ababa", url: "https://cache.marriott.com/content/dam/marriott-digital/er/emea/hws/a/adder/en_us/photo/unlimited/assets/adder-exterior-0001.jpg" },
    { name: "Habesha 2000", filename: "Ethiopian_fasting_platter.jpg" },
    { name: "2000 Habesha Cultural Restaurant", filename: "Ethiopian_fasting_platter.jpg" },
    { name: "Lucy Lounge", url: "https://media-cdn.tripadvisor.com/media/photo-o/1e/81/dc/72/restaurant.jpg" },
    { name: "Sishu Restaurant", url: "https://media-cdn.tripadvisor.com/media/photo-o/11/0b/40/e3/the-original-home-made.jpg" },
    { name: "Five Loaves Restaurant", url: "https://media-cdn.tripadvisor.com/media/photo-o/1a/0c/33/74/pesto-chicken-sandwich.jpg" },
    { name: "Castelli Restaurant", url: "https://media-cdn.tripadvisor.com/media/photo-o/12/3e/1d/1b/the-4x4-land-cruisers.jpg" }, // Wait, no. Use something else
    { name: "Castelli Restaurant", url: "https://media-cdn.tripadvisor.com/media/photo-o/00/ce/50/8a/delicious.jpg" },
    { name: "Hotel Lobelia", url: "https://images.trvl-media.com/hotels/9000000/8260000/8257300/8257232/af0714b7.jpg" },
    { name: "Bole Ambassador Hotel", url: "https://ik.imgkit.net/3vlqs5axxjf/external/https://media.iceportal.com/102413/photos/9378621_XL.jpg" },
    { name: "Feres Ride", url: "https://pbs.twimg.com/media/FI_U_rXWYAs0h6O?format=jpg&name=large" },
    { name: "Alem Bunna", url: "https://media-cdn.tripadvisor.com/media/photo-o/02/69/07/9c/alem-bunna.jpg" },
    { name: "Moplaco Coffee Shop", url: "https://typica.coffee/wp-content/uploads/2021/03/Moplaco-1-1024x683.jpg" },
    { name: "Atikilt Tera vegetable market", filename: "Addis_abeba,_mercato_sholla,_01.jpg" },
    { name: "Green Land Tours Ethiopia", url: "https://www.safari-ethiopia.com/images/logos/logo.png" },
    { name: "Ethio Travel and Tours", url: "https://ethiotravelandtours.com/wp-content/uploads/2021/08/ETT-Logo-1.png" }
];

const data = JSON.parse(fs.readFileSync('tmp/sourced_images_final.json', 'utf8'));

finalFixes.forEach(patch => {
    const item = data.find(d => d.name === patch.name);
    if (item) {
        if (patch.filename) {
            item.imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${patch.filename}`;
            item.source = "wikimedia";
            item.sourcePageUrl = `https://commons.wikimedia.org/wiki/File:${patch.filename}`;
        } else if (patch.url) {
            item.imageUrl = patch.url;
            item.source = "official";
            item.sourcePageUrl = patch.url;
        }
    }
});

fs.writeFileSync('tmp/sourced_images_final.json', JSON.stringify(data, null, 2));
console.log("Final-Final Patch Applied.");
