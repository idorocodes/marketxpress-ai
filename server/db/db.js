import PrismaClient from "@prisma/client"
const prisma = new global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

export default prisma