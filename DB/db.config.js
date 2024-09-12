import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient({
  // log: ["query"],
});

// async function main() {
//   const users = await prisma.user.findMany();
//   console.log(users);
// }

// main()
//   .catch((e) => {
//     throw e;
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
export default prisma;
