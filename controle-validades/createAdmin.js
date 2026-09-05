const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  const store = await prisma.store.create({
    data: {
      name: 'Loja Matriz',
      subscription: {
        create: {
          basePlanPrice: 0,
          status: 'active'
        }
      },
      users: {
        create: {
          email: 'admin@admin.com',
          passwordHash: hashedPassword,
          name: 'Administrador',
          role: 'admin'
        }
      }
    }
  });

  console.log('Usuário admin criado com sucesso!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
