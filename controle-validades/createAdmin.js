const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'admin@admin.com',
      passwordHash: hashedPassword,
      name: 'Administrador',
      role: 'admin'
    }
  });

  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      basePlanPrice: 0,
      status: 'active'
    }
  });

  const store = await prisma.store.create({
    data: {
      name: 'Loja Matriz',
      subscriptionId: subscription.id
    }
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { storeId: store.id }
  });

  console.log('Usuário admin criado com sucesso!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
