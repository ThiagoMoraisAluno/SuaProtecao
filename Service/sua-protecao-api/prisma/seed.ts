import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // Seed dos planos
  await prisma.plan.createMany({
    data: [
      {
        type: 'basic',
        name: 'Plano Básico',
        price: 49.99,
        servicesPerMonth: 1,
        coverageLimit: 20000,
        features: [
          '1 serviço por mês',
          'Cobertura até R$ 20.000',
          'Suporte via WhatsApp',
          'Encanamento e Elétrica',
          'Atendimento em até 48h',
        ],
        color: 'slate',
        popular: false,
      },
      {
        type: 'intermediate',
        name: 'Plano Intermediário',
        price: 99.90,
        servicesPerMonth: 2,
        coverageLimit: 40000,
        features: [
          '2 serviços por mês',
          'Cobertura até R$ 40.000',
          'Suporte prioritário',
          'Todos os serviços disponíveis',
          'Atendimento em até 24h',
          'Relatório de visitas',
        ],
        color: 'brand',
        popular: true,
      },
      {
        type: 'premium',
        name: 'Plano Premium',
        price: 169.90,
        servicesPerMonth: -1,
        coverageLimit: 80000,
        features: [
          'Serviços ilimitados',
          'Cobertura até R$ 80.000',
          'Suporte 24/7 prioritário',
          'Todos os serviços + reformas',
          'Atendimento emergencial',
          'Gestor de conta dedicado',
          'Relatórios mensais',
        ],
        color: 'navy',
        popular: false,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Planos criados/verificados.');

  // Criar usuário admin inicial
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@suaprotecao.com';
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin@123456';

  const hash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      passwordHash: hash,
      role: 'admin',
      profile: {
        create: { username: 'Admin Master' },
      },
    },
  });

  console.log(`✅ Usuário admin criado/verificado: ${adminEmail}`);
  console.log('✅ Seed concluído!');
}

main()
  .catch(console.error)
  .finally(() => void prisma.$disconnect());
