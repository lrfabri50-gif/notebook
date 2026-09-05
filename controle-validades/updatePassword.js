const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('Luiz4649*', 10);
  
  await prisma.user.update({
    where: { email: 'admin@admin.com' },
    data: { passwordHash: hashedPassword }
  });

  console.log('Senha atualizada com sucesso para o hash bcrypt!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
