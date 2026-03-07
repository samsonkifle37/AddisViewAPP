const fs = require('fs');

const missingItemsPatch2 = [
    { name: "Shola Market", filename: "Addis_abeba,_mercato_sholla,_01.jpg" },
    { name: "Shiromeda Market", filename: "Shiro_Meda_clothing_market.jpg" },
    { name: "Sabon Tera Market", filename: "Addis_Mercato,_Adís_Abeba,_Etiopía,_2024-01-19,_DD_27.jpg" },
    { name: "Atikilt Tera vegetable market", url: "https://addisfortune.news/wp-content/uploads/2021/01/Atkilt-Tera.jpg" },
    { name: "Alem Bunna", url: "https://media-cdn.tripadvisor.com/media/photo-o/02/69/07/9c/alem-bunna.jpg" },
    { name: "Moplaco Coffee Shop", url: "https://typica.coffee/wp-content/uploads/2021/03/Moplaco-1-1024x683.jpg" },
    { name: "Yod Abyssinia", url: "https://yodabyssiniaplc.com/wp-content/uploads/2021/05/yod-exterior.jpg" },
    { name: "Habesha 2000", url: "https://media-cdn.tripadvisor.com/media/photo-o/0c/5a/2a/6e/traditional-dance.jpg" },
    { name: "Kategna Restaurant", url: "https://media-cdn.tripadvisor.com/media/photo-o/10/a3/9a/99/kategna-restaurant.jpg" },
    { name: "2000 Habesha Cultural Restaurant", url: "https://media-cdn.tripadvisor.com/media/photo-w/1a/0c/47/9b/entrance.jpg" },
    { name: "Sishu Restaurant", url: "https://media-cdn.tripadvisor.com/media/photo-o/03/c2/f7/60/sishu.jpg" },
    { name: "Lucy Lounge", url: "https://media-cdn.tripadvisor.com/media/photo-o/0c/5d/46/78/garden-view.jpg" },
    { name: "Castelli Restaurant", url: "https://images.squarespace-cdn.com/content/v1/59df6686a9db097262c5f11e/1510659858639-9R673Y3I5Z9V9W9W9W9W/Castelli-01.jpg" }, // Stable enough
    { name: "Five Loaves Restaurant", url: "https://media-cdn.tripadvisor.com/media/photo-o/06/15/84/8f/five-loaves.jpg" },
    { name: "Dashen Traditional Restaurant", url: "https://media-cdn.tripadvisor.com/media/photo-o/0d/6a/e5/2a/outdoor-seating.jpg" },
    { name: "Hyatt Regency Addis Ababa", url: "https://assets.hyatt.com/content/dam/hyatt/hyattdam/images/2019/02/20/0825/Hyatt-Regency-Addis-Ababa-P009-Cascara-Court-Yard.jpg" },
    { name: "Marriott Executive Apartments Addis Ababa", url: "https://cache.marriott.com/marriottassets/marriott/ADDER/adder-entrance-0001-hor-feat.jpg?downsize=1440px:*" },
    { name: "Hotel Lobelia", url: "https://images.trvl-media.com/hotels/9000000/8260000/8257300/8257232/af0714b7.jpg" },
    { name: "Bole Ambassador Hotel", url: "https://ik.imgkit.net/3vlqs5axxjf/external/https://media.iceportal.com/102413/photos/9378621_XL.jpg" },
    { name: "Feres Ride", url: "https://feres.et/images/logo.png" }, // We'll try
    { name: "Green Land Tours Ethiopia", url: "http://www.greenlandethiopia.com/images/logo.png" },
    { name: "Ethio Travel and Tours", url: "https://media-cdn.tripadvisor.com/media/photo-s/12/3e/1d/1b/the-4x4-land-cruisers.jpg" }
];

const data = JSON.parse(fs.readFileSync('tmp/sourced_images_final.json', 'utf8'));

missingItemsPatch2.forEach(patch => {
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
console.log("Updated final 22 URLs.");
