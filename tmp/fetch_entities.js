const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
    const names = [
        'Holy Trinity Cathedral',
        'Unity Park',
        'Menelik II Palace',
        'Red Terror Martyrs Memorial Museum',
        'Ethnological Museum (Addis Ababa University)'
    ];
    const places = await prisma.place.findMany({
        where: {
            name: {
                in: names
            }
        },
        select: {
            id: true,
            name: true,
            slug: true
        }
    });
    console.log(JSON.stringify(places, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
