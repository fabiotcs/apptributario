import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================================================
  // ADMIN USER
  // ============================================================================
  console.log('👤 Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@agente-tributario.local',
      passwordHash: '$2b$10$YourHashedPasswordHere', // Placeholder - should be actual bcrypt hash
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Admin user created: ${adminUser.email}\n`);

  // ============================================================================
  // CONTADOR USER (Accountant)
  // ============================================================================
  console.log('👤 Creating contador (accountant) user...');
  const contadorUser = await prisma.user.create({
    data: {
      email: 'maria.oliveira@contabilidade.com.br',
      passwordHash: '$2b$10$YourHashedPasswordHere',
      name: 'Maria Oliveira',
      role: 'CONTADOR',
    },
  });
  console.log(`✅ Contador user created: ${contadorUser.email}\n`);

  // ============================================================================
  // EMPRESÁRIO USER (Business Owner)
  // ============================================================================
  console.log('👤 Creating empresário (business owner) user...');
  const empresarioUser = await prisma.user.create({
    data: {
      email: 'joao.silva@example.com',
      passwordHash: '$2b$10$YourHashedPasswordHere',
      name: 'João Silva',
      role: 'EMPRESARIO',
    },
  });
  console.log(`✅ Empresário user created: ${empresarioUser.email}\n`);

  // ============================================================================
  // COMPANIES
  // ============================================================================
  console.log('🏢 Creating sample companies...');

  // Company 1: Silva Construções (Simples Nacional)
  const silvaConstruction = await prisma.company.create({
    data: {
      cnpj: '12.345.678/0001-99',
      name: 'Silva Construções LTDA',
      taxRegime: 'SIMPLES_NACIONAL',
      revenue: 425500 * 100, // R$ 425.500 in centavos
      employees: 12,
      ownerId: empresarioUser.id,
    },
  });
  console.log(`✅ Created: ${silvaConstruction.name} (${silvaConstruction.cnpj})`);

  // Company 2: Tech Solutions (Lucro Presumido)
  const techSolutions = await prisma.company.create({
    data: {
      cnpj: '98.765.432/0001-99',
      name: 'Tech Solutions LLC',
      taxRegime: 'LUCRO_PRESUMIDO',
      revenue: 340000 * 100, // R$ 340.000 in centavos
      employees: 8,
      ownerId: empresarioUser.id,
    },
  });
  console.log(`✅ Created: ${techSolutions.name} (${techSolutions.cnpj})\n`);

  // ============================================================================
  // COMPANY USERS (Multi-tenant relationships)
  // ============================================================================
  console.log('🔗 Creating company-user relationships...');

  // Contador has access to both companies
  await prisma.companyUser.create({
    data: {
      userId: contadorUser.id,
      companyId: silvaConstruction.id,
      role: 'ACCOUNTANT',
    },
  });
  console.log(`✅ ${contadorUser.name} → ${silvaConstruction.name}`);

  await prisma.companyUser.create({
    data: {
      userId: contadorUser.id,
      companyId: techSolutions.id,
      role: 'ACCOUNTANT',
    },
  });
  console.log(`✅ ${contadorUser.name} → ${techSolutions.name}\n`);

  // ============================================================================
  // COMPANY BRANCHES
  // ============================================================================
  console.log('🏪 Creating company branches...');

  await prisma.companyBranch.create({
    data: {
      companyId: silvaConstruction.id,
      name: 'Matriz - São Paulo',
      cnpj: '12.345.678/0002-79',
      state: 'SP',
    },
  });
  console.log(`✅ Branch: Silva Construções (SP)`);

  await prisma.companyBranch.create({
    data: {
      companyId: silvaConstruction.id,
      name: 'Filial - Rio de Janeiro',
      cnpj: '12.345.678/0003-59',
      state: 'RJ',
    },
  });
  console.log(`✅ Branch: Silva Construções (RJ)\n`);

  // ============================================================================
  // REGIME HISTORY
  // ============================================================================
  console.log('📊 Creating regime history...');

  await prisma.regimeHistory.create({
    data: {
      companyId: silvaConstruction.id,
      fromRegime: 'LUCRO_REAL',
      toRegime: 'SIMPLES_NACIONAL',
      effectiveDate: new Date('2023-01-15'),
      reason: 'Company transitioned to Simples Nacional due to revenue decline',
    },
  });
  console.log(`✅ Regime history: ${silvaConstruction.name}\n`);

  // ============================================================================
  // RECEIPT CLASSIFICATIONS
  // ============================================================================
  console.log('📋 Creating receipt classifications...');

  // Silva Construção: 65% Serviços, 35% Produtos
  await prisma.receiptClassification.create({
    data: {
      companyId: silvaConstruction.id,
      type: 'SERVICO',
      amount: 276575 * 100, // R$ 276.575
      classificationCode: '7490100',
    },
  });
  console.log(`✅ ${silvaConstruction.name}: 65% Serviços (R$ 276.575)`);

  await prisma.receiptClassification.create({
    data: {
      companyId: silvaConstruction.id,
      type: 'PRODUTO',
      amount: 148925 * 100, // R$ 148.925
      classificationCode: '5010100',
    },
  });
  console.log(`✅ ${silvaConstruction.name}: 35% Produtos (R$ 148.925)\n`);

  // ============================================================================
  // SUBSCRIPTIONS
  // ============================================================================
  console.log('💳 Creating subscriptions...');

  const today = new Date();
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.subscription.create({
    data: {
      companyId: silvaConstruction.id,
      tier: 'PRO',
      status: 'ACTIVE',
      currentPeriodStart: today,
      currentPeriodEnd: nextMonth,
    },
  });
  console.log(`✅ ${silvaConstruction.name}: PRO subscription`);

  await prisma.subscription.create({
    data: {
      companyId: techSolutions.id,
      tier: 'BASIC',
      status: 'ACTIVE',
      currentPeriodStart: today,
      currentPeriodEnd: nextMonth,
    },
  });
  console.log(`✅ ${techSolutions.name}: BASIC subscription\n`);

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================
  console.log('🔔 Creating notifications...');

  await prisma.notification.create({
    data: {
      userId: empresarioUser.id,
      type: 'REGIME_ALERT',
      title: 'Seu faturamento está em 85% do limite',
      message: 'Você está próximo do limite de faturamento do Simples Nacional. Considere analisar uma transição de regime.',
      isRead: false,
    },
  });
  console.log(`✅ Notification: Regime alert for ${empresarioUser.name}`);

  await prisma.notification.create({
    data: {
      userId: empresarioUser.id,
      type: 'LEGISLATION_UPDATE',
      title: 'Nova legislação: ISS em São Paulo',
      message: 'A alíquota de ISS em São Paulo foi atualizada. Verifique o impacto em seus serviços.',
      isRead: false,
    },
  });
  console.log(`✅ Notification: Legislation update\n`);

  // ============================================================================
  // CHAT HISTORY
  // ============================================================================
  console.log('💬 Creating chat history...');

  await prisma.chatHistory.create({
    data: {
      userId: empresarioUser.id,
      companyId: silvaConstruction.id,
      role: 'USER',
      content: 'Qual é o regime tributário mais apropriado para minha empresa?',
    },
  });
  console.log(`✅ User message: Regime inquiry`);

  await prisma.chatHistory.create({
    data: {
      userId: empresarioUser.id,
      companyId: silvaConstruction.id,
      role: 'ASSISTANT',
      content: 'Com base na sua receita de R$ 425.500 e perfil de atividade (construção), o regime mais adequado seria...',
    },
  });
  console.log(`✅ AI response: Regime analysis\n`);

  // ============================================================================
  // COUNTER ALERTS
  // ============================================================================
  console.log('⚠️  Creating counter alerts...');

  await prisma.counterAlert.create({
    data: {
      companyId: silvaConstruction.id,
      alertType: 'FATURAMENTO_LIMIT',
      message: 'Silva Construções está em 85% do limite Simples Nacional. Recomenda-se análise de transição.',
      severity: 'HIGH',
      isResolved: false,
    },
  });
  console.log(`✅ Counter alert: Faturamento limit for ${silvaConstruction.name}\n`);

  // ============================================================================
  // REFERRALS
  // ============================================================================
  console.log('🎯 Creating referrals...');

  await prisma.referral.create({
    data: {
      companyId: techSolutions.id,
      referrerEmail: contadorUser.email,
      commissionRate: 0.15, // 15%
      status: 'ACTIVE',
      monthlyEarnings: 50000, // R$ 500 in centavos
    },
  });
  console.log(`✅ Referral: ${contadorUser.name} → ${techSolutions.name} (15% commission)\n`);

  // ============================================================================
  // AUDIT LOGS
  // ============================================================================
  console.log('📝 Creating audit logs...');

  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      action: 'CREATE',
      resource: 'User',
      resourceId: empresarioUser.id,
      ipAddress: '192.168.1.1',
      userAgent: 'Seed Script',
    },
  });
  console.log(`✅ Audit log: Admin created ${empresarioUser.name}`);

  await prisma.auditLog.create({
    data: {
      userId: adminUser.id,
      companyId: silvaConstruction.id,
      action: 'CREATE',
      resource: 'Company',
      resourceId: silvaConstruction.id,
      ipAddress: '192.168.1.1',
      userAgent: 'Seed Script',
    },
  });
  console.log(`✅ Audit log: Admin created ${silvaConstruction.name}\n`);

  // ============================================================================
  // SUMMARY
  // ============================================================================
  console.log('═'.repeat(60));
  console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY');
  console.log('═'.repeat(60));
  console.log('\n📊 Summary:');
  console.log(`  • Users: 3 (1 admin, 1 contador, 1 empresário)`);
  console.log(`  • Companies: 2`);
  console.log(`  • Branches: 2`);
  console.log(`  • Notifications: 2`);
  console.log(`  • Chat messages: 2`);
  console.log(`  • Subscriptions: 2`);
  console.log(`  • Audit logs: 2`);
  console.log('\n🚀 Ready to test the API!\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
