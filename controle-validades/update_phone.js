const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.updateMany({
    data: { phoneWhatsapp: '14991395451' }
  });
  console.log('Atualizados:', result.count);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
