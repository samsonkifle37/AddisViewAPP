import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const PLACES = [
    {
        name: "Hyatt Regency Addis Ababa",
        type: "hotel",
        city: "Addis Ababa",
        area: "Meskel Square",
        country: "Ethiopia",
        websiteUrl: "https://www.hyatt.com/hyatt-regency/en-US/addra-hyatt-regency-addis-ababa",
        bookingUrl: "https://hyattregencyaddisababa.com-hotel.website/",
        tags: ["upscale", "business", "central"],
        source: "manual-seed",
        shortDescription: "Five-star luxury hotel overlooking Meskel Square in the heart of Addis Ababa, offering world-class amenities and stunning city views.",
        longDescription: "The Hyatt Regency Addis Ababa is the premier luxury hotel in Ethiopia's capital. Located on Meskel Square, it offers 188 spacious rooms, a rooftop pool, multiple dining venues, a full-service spa, and state-of-the-art conference facilities. Perfect for business travelers and those seeking upscale comfort.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200", altText: "Hyatt Regency exterior", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200", altText: "Luxury hotel room", priority: 1 },
            { imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1200", altText: "Hotel pool area", priority: 2 },
        ],
    },
    {
        name: "Ethiopian Skylight Hotel",
        type: "hotel",
        city: "Addis Ababa",
        area: "Bole",
        country: "Ethiopia",
        websiteUrl: "https://www.ethiopianskylighthotel.com/",
        bookingUrl: "https://www.ethiopianskylighthotel.com/",
        tags: ["airport-hotel", "modern", "business"],
        source: "manual-seed",
        shortDescription: "Modern luxury hotel operated by Ethiopian Airlines, strategically located near Bole International Airport with contemporary design.",
        longDescription: "Ethiopian Skylight Hotel is a contemporary 5-star property located just minutes from Addis Ababa Bole International Airport. Owned and operated by Ethiopian Airlines Group, it features modern rooms with city views, international cuisine, a business center, and seamless airport transfer services.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200", altText: "Modern hotel exterior", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200", altText: "Hotel room with view", priority: 1 },
        ],
    },
    {
        name: "Mado Hotel",
        type: "hotel",
        city: "Addis Ababa",
        area: "Bole",
        country: "Ethiopia",
        websiteUrl: "https://madohotels.com/",
        bookingUrl: "https://madoaddisababa.com-hotel.website/",
        tags: ["mid-range", "bole", "airport-access"],
        source: "manual-seed",
        shortDescription: "Stylish mid-range hotel in the vibrant Bole district, offering modern comfort with easy airport access and local charm.",
        longDescription: "Mado Hotel provides a comfortable and modern stay in one of Addis Ababa's most popular neighborhoods. With well-appointed rooms, a restaurant serving both Ethiopian and international cuisine, and proximity to shops, cafes, and the airport, it's a great choice for both business and leisure travelers.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200", altText: "Mado Hotel exterior", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200", altText: "Comfortable hotel room", priority: 1 },
        ],
    },
    {
        name: "Haile Grand Addis Ababa",
        type: "hotel",
        city: "Addis Ababa",
        area: "Lamberet",
        country: "Ethiopia",
        websiteUrl: "https://hailehotelsandresorts.com/",
        bookingUrl: "https://hailehotelsandresorts.com/",
        tags: ["ethiopian-brand", "business", "conference"],
        source: "manual-seed",
        shortDescription: "Flagship Ethiopian-owned luxury hotel by Olympic champion Haile Gebrselassie, combining world-class service with Ethiopian hospitality.",
        longDescription: "Haile Grand Hotel is a proudly Ethiopian 5-star hotel owned by the legendary Olympian Haile Gebrselassie. Located in the Lamberet area, it features elegant rooms, a rooftop restaurant with panoramic views, conference facilities, a spa, and an outdoor pool. A symbol of Ethiopian excellence in hospitality.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200", altText: "Grand hotel exterior", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200", altText: "Elegant room", priority: 1 },
        ],
    },
    {
        name: "Adot Tina Hotel",
        type: "guesthouse",
        city: "Addis Ababa",
        area: "Bole",
        country: "Ethiopia",
        websiteUrl: "https://adottinahotel.com/",
        bookingUrl: "https://adottinahotel.com/rooms",
        tags: ["luxury", "city-center"],
        source: "manual-seed",
        shortDescription: "Boutique guesthouse in Bole offering personalized service and luxury amenities in a cozy, intimate setting.",
        longDescription: "Adot Tina Hotel is a premium boutique guesthouse in the heart of Bole. Known for its personalized service and attention to detail, it features elegantly designed rooms, a restaurant serving local and continental cuisine, and a warm atmosphere that feels like home. Ideal for travelers who prefer boutique charm over large hotels.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200", altText: "Boutique guesthouse room", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200", altText: "Cozy interior", priority: 1 },
        ],
    },
    {
        name: "Z Guest House",
        type: "guesthouse",
        city: "Addis Ababa",
        area: "Arada",
        country: "Ethiopia",
        websiteUrl: "https://zguesthouse.com/",
        bookingUrl: "https://www.tripadvisor.co.uk/Hotel_Review-g293791-d805598-Reviews-Z_Guest_House-Addis_Ababa.html",
        tags: ["guesthouse", "budget", "garden"],
        source: "manual-seed",
        shortDescription: "Charming budget-friendly guesthouse in the historic Arada district, featuring a beautiful garden and warm local hospitality.",
        longDescription: "Z Guest House offers a peaceful retreat in the historic Arada area. With a beautiful garden setting, clean and comfortable rooms, and genuine Ethiopian hospitality, it's perfect for budget-conscious travelers who want an authentic local experience. Close to historical sites, markets, and local eateries.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200", altText: "Guesthouse with garden", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200", altText: "Cozy bedroom", priority: 1 },
        ],
    },
    {
        name: "Bole Luxury Apartment",
        type: "apartment",
        city: "Addis Ababa",
        area: "Bole",
        country: "Ethiopia",
        websiteUrl: "https://www.airbnb.com/rooms/1539327135533347646",
        bookingUrl: "https://www.airbnb.com/rooms/1539327135533347646",
        tags: ["apartment", "family", "bole"],
        source: "manual-seed",
        shortDescription: "Fully furnished luxury apartment in Bole — perfect for families and extended stays with all the comforts of home.",
        longDescription: "This spacious, fully furnished apartment in the Bole neighborhood is ideal for families and travelers seeking a home-away-from-home experience. Features include a modern kitchen, large living area, fast Wi-Fi, and proximity to restaurants, cafes, and the airport.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200", altText: "Modern apartment living room", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200", altText: "Apartment kitchen", priority: 1 },
        ],
    },
    {
        name: "Entoto Natural Park",
        type: "tour",
        city: "Addis Ababa",
        area: "Entoto",
        country: "Ethiopia",
        websiteUrl: "https://www.entoto-natural-park.org/",
        bookingUrl: "https://www.tripadvisor.co.uk/Attraction_Review-g293791-d15086967-Reviews-Entoto_Natural_Park-Addis_Ababa.html",
        tags: ["nature", "hiking", "day-trip"],
        source: "manual-seed",
        shortDescription: "Lush urban nature park atop Mount Entoto with hiking trails, panoramic city views, and eucalyptus forests.",
        longDescription: "Entoto Natural Park sits at 3,200 meters above sea level on Mount Entoto, the highest point overlooking Addis Ababa. The park offers well-maintained hiking trails through eucalyptus forests, stunning panoramic views of the city, historical churches, and a chance to escape the urban bustle. Perfect for a half-day nature adventure.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200", altText: "Mountain forest trail", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200", altText: "Forest canopy", priority: 1 },
        ],
    },
    {
        name: "Rock-Hewn Churches of Lalibela",
        type: "tour",
        city: "Lalibela",
        area: "",
        country: "Ethiopia",
        websiteUrl: "https://whc.unesco.org/en/list/18/",
        bookingUrl: "https://www.tripadvisor.co.uk/Attraction_Review-g480193-d19323318-Reviews-Lalibela_Rock_Hewn_Churches-Lalibela_Amhara_Region.html",
        tags: ["unesco", "historic", "pilgrimage"],
        source: "manual-seed",
        shortDescription: "UNESCO World Heritage site featuring 11 medieval monolithic churches carved from solid rock — Ethiopia's most iconic destination.",
        longDescription: "The Rock-Hewn Churches of Lalibela are one of the world's most remarkable religious and architectural sites. Built in the 12th-13th century under King Lalibela, these 11 monolithic churches were carved directly from volcanic rock. The most famous is Bete Giyorgis (Church of Saint George), a cross-shaped structure excavated 15 meters into the ground. A must-visit pilgrimage site.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1621252179027-94459d278660?w=1200", altText: "Lalibela church from above", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200", altText: "Ancient church interior", priority: 1 },
        ],
    },
    {
        name: "Danakil Depression Tour",
        type: "tour",
        city: "Semera / Mekele",
        area: "Afar Region",
        country: "Ethiopia",
        websiteUrl: "https://ethiotours.travel/danakil-depression-tours",
        bookingUrl: "https://ethiotours.travel/danakil-depression-tours",
        tags: ["desert", "adventure", "volcano"],
        source: "manual-seed",
        shortDescription: "Journey to one of Earth's most extreme and surreal landscapes — colorful sulfur springs, lava lakes, and vast salt flats.",
        longDescription: "The Danakil Depression is one of the hottest inhabited places on Earth, sitting 125 meters below sea level. This multi-day tour takes you through an otherworldly landscape of colorful sulfur springs at Dallol, the active Erta Ale lava lake, and expansive salt flats mined by Afar camel caravans. An unforgettable adventure for intrepid travelers.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=1200", altText: "Colorful sulfur springs", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200", altText: "Desert landscape", priority: 1 },
        ],
    },
    {
        name: "Bale Mountains National Park",
        type: "tour",
        city: "Bale",
        area: "",
        country: "Ethiopia",
        websiteUrl: "https://balemountains.org/",
        bookingUrl: "https://balemountains.org/the-park/",
        tags: ["national-park", "wildlife", "trekking"],
        source: "manual-seed",
        shortDescription: "Home to the rare Ethiopian wolf and giant lobelia, the Bale Mountains offer world-class trekking and unique Afro-alpine scenery.",
        longDescription: "Bale Mountains National Park is a biodiversity hotspot in southeastern Ethiopia. It's home to the critically endangered Ethiopian wolf, the Bale monkey, and over 300 species of birds. The park features the Sanetti Plateau (Africa's largest Afro-alpine habitat at 4,000m), the Harenna Forest, and numerous waterfalls. A paradise for trekkers and wildlife enthusiasts.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200", altText: "Mountain landscape", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200", altText: "Highland scenery", priority: 1 },
        ],
    },
    {
        name: "Yod Abyssinia Cultural Restaurant",
        type: "restaurant",
        city: "Addis Ababa",
        area: "Bole",
        country: "Ethiopia",
        websiteUrl: "https://yodabyssiniaplc.com/",
        bookingUrl: "https://www.tripadvisor.co.uk/Restaurant_Review-g293791-d1477419-Reviews-Yod_Abyssinia_Traditional_Food-Addis_Ababa.html",
        tags: ["cultural-show", "traditional-food", "music"],
        source: "manual-seed",
        shortDescription: "Award-winning cultural restaurant featuring traditional Ethiopian cuisine, live music, and mesmerizing traditional dance performances.",
        longDescription: "Yod Abyssinia is Addis Ababa's premier cultural dining experience. Enjoy authentic Ethiopian dishes like Doro Wot, Kitfo, and an array of vegetarian beyaynetu while watching spectacular traditional dance performances from Ethiopia's diverse ethnic groups. The live Azmari music and energetic dancing create an unforgettable evening.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200", altText: "Cultural dinner setting", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=1200", altText: "Traditional food spread", priority: 1 },
        ],
    },
    {
        name: "Totot Traditional Restaurant",
        type: "restaurant",
        city: "Addis Ababa",
        area: "Gerji",
        country: "Ethiopia",
        websiteUrl: "https://totottraditionalrestaurant.com.et/",
        bookingUrl: "https://www.tripadvisor.co.uk/Restaurant_Review-g293791-d8736886-Reviews-Totot-Addis_Ababa.html",
        tags: ["cultural-show", "traditional-food", "dance"],
        source: "manual-seed",
        shortDescription: "Beloved traditional restaurant in Gerji known for its vibrant cultural shows, delicious Ethiopian cuisine, and lively atmosphere.",
        longDescription: "Totot Traditional Restaurant serves up authentic Ethiopian food alongside nightly cultural performances that showcase the country's rich heritage. From energetic shoulder-dancing (eskista) to soulful Azmari music, every evening is a celebration. The menu features classic dishes prepared with traditional spices and served on injera.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200", altText: "Restaurant interior", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200", altText: "Spices and food", priority: 1 },
        ],
    },
    {
        name: "2000 Habesha Cultural Restaurant",
        type: "restaurant",
        city: "Addis Ababa",
        area: "Bole Atlas",
        country: "Ethiopia",
        websiteUrl: "https://2000habesha.net/",
        bookingUrl: "https://www.tripadvisor.co.uk/Restaurant_Review-g293791-d1650594-Reviews-2000_Habesha_Cultural_Restaurant-Addis_Ababa.html",
        tags: ["cultural-show", "traditional-food", "live-music"],
        source: "manual-seed",
        shortDescription: "Grand Ethiopian cultural dining venue at Bole Atlas, famous for its elaborate stage shows and extensive traditional menu.",
        longDescription: "2000 Habesha is one of Addis Ababa's grandest cultural restaurants. Seating hundreds of guests in a beautifully decorated hall, it features an elaborate stage with nightly performances of traditional music and dances from across Ethiopia's nations. The extensive menu showcases the best of Ethiopian cuisine.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200", altText: "Grand restaurant hall", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1200", altText: "Coffee ceremony", priority: 1 },
        ],
    },
    {
        name: "Kuriftu Resort & Spa",
        type: "resort",
        city: "Multiple locations",
        area: "",
        country: "Ethiopia",
        websiteUrl: "https://www.kurifturesorts.com/",
        bookingUrl: "https://www.kurifturesorts.com/",
        tags: ["resort", "spa", "lake-side"],
        source: "manual-seed",
        shortDescription: "Ethiopia's premier resort chain with lakeside properties offering spa treatments, water activities, and serene natural escapes.",
        longDescription: "Kuriftu Resort & Spa is Ethiopia's leading resort brand with multiple locations including Bishoftu (Debre Zeit), Lake Tana (Bahir Dar), and Lake Langano. Each property offers luxurious lakeside accommodation, full-service spa treatments, swimming pools, water sports, and fine dining. Perfect for weekend getaways and romantic retreats.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200", altText: "Lakeside resort", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200", altText: "Spa and pool area", priority: 1 },
        ],
    },
    {
        name: "Fendika Cultural Center",
        type: "club",
        city: "Addis Ababa",
        area: "",
        country: "Ethiopia",
        websiteUrl: "https://fendika.org/",
        bookingUrl: "https://fendika.org/performances",
        tags: ["live-music", "azmari", "traditional"],
        source: "manual-seed",
        shortDescription: "Legendary Azmari music venue and cultural center preserving Ethiopia's traditional performing arts in an authentic setting.",
        longDescription: "Fendika Cultural Center is one of Addis Ababa's most authentic music venues. Founded to preserve Ethiopia's rich tradition of Azmari music, it hosts regular performances featuring master musicians, traditional dancers, and poetry. The intimate setting lets you experience the soul of Ethiopian nightlife at its most genuine.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200", altText: "Live music performance", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200", altText: "Concert atmosphere", priority: 1 },
        ],
    },
    {
        name: "The Mosaic Hotel",
        type: "club",
        city: "Addis Ababa",
        area: "Bole",
        country: "Ethiopia",
        websiteUrl: "https://themosaichotel.co/",
        bookingUrl: "https://themosaichotel.co/book-direct/",
        tags: ["hotel", "bar", "events"],
        source: "manual-seed",
        shortDescription: "Trendy Bole hotel with a popular rooftop bar featuring live DJs, cocktail events, and panoramic city views.",
        longDescription: "The Mosaic Hotel in Bole is where modern hospitality meets Addis Ababa's nightlife scene. Beyond its boutique hotel rooms, it's known for its vibrant rooftop bar hosting DJ nights, live music events, and cocktail hours with panoramic views of the city. A hotspot for both tourists and locals.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1200", altText: "Rooftop bar", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200", altText: "Cocktail lounge", priority: 1 },
        ],
    },
    {
        name: "Totot Lounge",
        type: "club",
        city: "Addis Ababa",
        area: "Edna Mall area",
        country: "Ethiopia",
        websiteUrl: "https://www.instagram.com/seven7_hotel_/",
        bookingUrl: "https://www.instagram.com/seven7_hotel_/",
        tags: ["lounge", "nightlife", "music"],
        source: "manual-seed",
        shortDescription: "Stylish lounge near Edna Mall known for its vibrant nightlife atmosphere, live music sets, and eclectic cocktail menu.",
        longDescription: "Totot Lounge is a popular nightlife destination near Edna Mall in Addis Ababa. With its modern interior, craft cocktails, and regular live music and DJ sets, it draws a lively crowd of young professionals and visitors looking for a fun night out in the city.",
        images: [
            { imageUrl: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200", altText: "Lounge interior", priority: 0 },
            { imageUrl: "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1200", altText: "Night scene", priority: 1 },
        ],
    },
];

async function main() {
    console.log("🌱 Starting V2 Seed...\n");

    for (const placeData of PLACES) {
        const { images, ...rest } = placeData;
        const slug = rest.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");

        const place = await prisma.place.upsert({
            where: { slug },
            update: { ...rest },
            create: { ...rest, slug },
        });

        // Delete existing images and re-create
        await prisma.placeImage.deleteMany({ where: { placeId: place.id } });
        if (images && images.length > 0) {
            await prisma.placeImage.createMany({
                data: images.map((img, i) => ({
                    placeId: place.id,
                    imageUrl: img.imageUrl,
                    altText: img.altText || rest.name,
                    priority: img.priority ?? i,
                })),
            });
        }

        console.log(`  ✅ ${rest.type.padEnd(12)} ${rest.name}`);
    }

    console.log(`\n🎉 Seeded ${PLACES.length} places with images!`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
