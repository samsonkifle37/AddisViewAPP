import prisma from '../src/lib/prisma'; prisma.place.findMany({ take: 1 }).then(console.log).catch(console.error);
