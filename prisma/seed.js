const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuários de teste
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const pastorPassword = await bcrypt.hash('Pastor@123', 12);
  const memberPassword = await bcrypt.hash('Membro@123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@qmd.com' },
    update: {},
    create: {
      email: 'admin@qmd.com',
      password: adminPassword,
      name: 'Administrador QMD',
      role: 'ADMIN',
      emailVerified: true,
      memberSince: new Date('2020-01-01'),
      profile: { create: { bio: 'Administrador do sistema' } },
    },
  });

  const pastor = await prisma.user.upsert({
    where: { email: 'pastor@qmd.com' },
    update: {},
    create: {
      email: 'pastor@qmd.com',
      password: pastorPassword,
      name: 'Pastor Carlos Silva',
      role: 'LEADER',
      emailVerified: true,
      phone: '(11) 99999-0001',
      memberSince: new Date('2018-01-01'),
      profile: { create: { bio: 'Pastor titular da Igreja QMD', ministry: 'Pastoreio' } },
    },
  });

  const member = await prisma.user.upsert({
    where: { email: 'membro@qmd.com' },
    update: {},
    create: {
      email: 'membro@qmd.com',
      password: memberPassword,
      name: 'João da Silva',
      role: 'MEMBER',
      emailVerified: true,
      phone: '(11) 99999-0002',
      memberSince: new Date('2022-03-15'),
      profile: { create: { bio: 'Membro fiel da QMD' } },
    },
  });

  console.log('✅ Usuários criados');

  // Versículo do dia
  await prisma.dailyVerse.upsert({
    where: { date: new Date(new Date().toDateString()) },
    update: {},
    create: {
      reference: 'Filipenses 4:13',
      text: 'Tudo posso naquele que me fortalece.',
      reflection: 'Deus nos capacita para enfrentar todos os desafios da vida. Confie Nele!',
      date: new Date(new Date().toDateString()),
      createdBy: pastor.id,
    },
  });

  console.log('✅ Versículo do dia criado');

  // Mensagem pastoral
  await prisma.pastoralMessage.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Você é amado por Deus!',
        content: 'Querida família QMD,\n\nDeus tem um plano único e especial para cada um de vocês. Não importa o que você esteja passando hoje, saiba que o amor de Deus é maior do que qualquer circunstância. Continue firme na fé, pois Ele nunca nos abandona.\n\nEm Cristo, Pastor Carlos',
        authorName: 'Pastor Carlos Silva',
        authorId: pastor.id,
        isPublished: true,
      },
      {
        title: 'A importância da oração diária',
        content: 'A oração é o canal que nos conecta diretamente ao coração de Deus. Quando oramos, não apenas pedimos, mas nos aproximamos dEle e conhecemos Sua vontade para nossas vidas. Reserve tempo hoje para orar e escutar o que Deus tem a dizer a você.',
        authorName: 'Pastor Carlos Silva',
        authorId: pastor.id,
        isPublished: true,
      },
    ],
  });

  console.log('✅ Mensagens pastorais criadas');

  // Devocionais
  await prisma.devotional.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Fé que move montanhas',
        theme: 'Fé',
        content: 'Jesus disse: "Se vocês tiverem fé do tamanho de um grão de mostarda, poderão dizer a esta montanha: Mova-se daqui para lá, e ela obedecerá; nada lhes será impossível."\n\nA fé não se mede pelo tamanho, mas pela direção. Uma fé pequena em um Deus grande pode transformar situações impossíveis em milagres. Hoje, deposite sua confiança nEle.',
        verseRef: 'Mateus 17:20',
        verseText: 'Se vocês tiverem fé do tamanho de um grão de mostarda...',
        authorName: 'Pastor Carlos Silva',
        isPublished: true,
      },
      {
        title: 'Paz que excede o entendimento',
        theme: 'Ansiedade',
        content: 'Em um mundo cheio de preocupações, Deus nos oferece uma paz que vai além da compreensão humana. Quando nos sentimos ansiosos, Ele nos chama para depositar todos os nossos fardos em Seus pés e descansar em Seu amor.',
        verseRef: 'Filipenses 4:6-7',
        verseText: 'Não andem ansiosos por coisa alguma, mas em tudo, pela oração e súplicas, e com ação de graças, apresentem seus pedidos a Deus.',
        authorName: 'Pastor Carlos Silva',
        isPublished: true,
      },
      {
        title: 'O amor que une a família',
        theme: 'Família',
        content: 'Deus criou a família como o reflexo do Seu amor. Uma família que ora junta, que estuda a Palavra juntos e que se perdoa mutuamente reflete o caráter de Deus ao mundo ao redor.',
        verseRef: 'Josué 24:15',
        verseText: 'Quanto a mim e à minha família, serviremos ao Senhor.',
        authorName: 'Pastor Carlos Silva',
        isPublished: true,
      },
      {
        title: 'O propósito da sua vida',
        theme: 'Propósito',
        content: 'Você não veio ao mundo por acidente. Deus te criou com um propósito único e especial. Antes mesmo de você nascer, Ele já tinha planos para a sua vida. Busque a Deus, descubra seu chamado e viva plenamente!',
        verseRef: 'Jeremias 29:11',
        verseText: 'Porque eu sei os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de causar dano, planos de dar a vocês esperança e um futuro.',
        authorName: 'Pastor Carlos Silva',
        isPublished: true,
      },
    ],
  });

  console.log('✅ Devocionais criados');

  // Categorias de sermão
  const categories = await Promise.all([
    prisma.sermonCategory.upsert({ where: { name: 'Fé' }, update: {}, create: { name: 'Fé' } }),
    prisma.sermonCategory.upsert({ where: { name: 'Família' }, update: {}, create: { name: 'Família' } }),
    prisma.sermonCategory.upsert({ where: { name: 'Oração' }, update: {}, create: { name: 'Oração' } }),
    prisma.sermonCategory.upsert({ where: { name: 'Cura' }, update: {}, create: { name: 'Cura' } }),
    prisma.sermonCategory.upsert({ where: { name: 'Propósito' }, update: {}, create: { name: 'Propósito' } }),
    prisma.sermonCategory.upsert({ where: { name: 'Louvor' }, update: {}, create: { name: 'Louvor' } }),
  ]);

  // Sermões
  await prisma.sermon.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'O Poder da Ressurreição',
        description: 'Mensagem poderosa sobre como a ressurreição de Cristo transforma nossas vidas e nos dá esperança para cada dia.',
        preacher: 'Pastor Carlos Silva',
        categoryId: categories[0].id,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        verses: 'João 11:25, Romanos 6:4',
        duration: '45 min',
        isPublished: true,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Família no Plano de Deus',
        description: 'Como construir uma família sólida baseada nos princípios bíblicos.',
        preacher: 'Pastor Carlos Silva',
        categoryId: categories[1].id,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        verses: 'Efésios 5:22-33, Josué 24:15',
        duration: '52 min',
        isPublished: true,
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Oração que Transforma',
        description: 'Aprenda a desenvolver uma vida de oração que muda circunstâncias e fortalece sua fé.',
        preacher: 'Pastor Carlos Silva',
        categoryId: categories[2].id,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        verses: 'Filipenses 4:6-7, Mateus 6:9-13',
        duration: '48 min',
        isPublished: true,
        publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✅ Sermões criados');

  // Eventos
  const now = new Date();
  await prisma.event.createMany({
    skipDuplicates: true,
    data: [
      {
        title: 'Culto de Domingo',
        description: 'Venha adorar a Deus conosco neste culto especial de domingo! Haverá louvor, palavra poderosa e comunhão.',
        location: 'Templo Principal - Rua das Flores, 123',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 19, 0),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 21, 0),
        type: 'culto',
        isRecurring: true,
        createdBy: admin.id,
      },
      {
        title: 'Culto de Quarta - Estudos Bíblicos',
        description: 'Aprofunde seu conhecimento na Palavra de Deus com nosso estudo bíblico semanal.',
        location: 'Templo Principal',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 19, 30),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5, 21, 0),
        type: 'culto',
        isRecurring: true,
        createdBy: admin.id,
      },
      {
        title: 'Retiro de Jovens QMD',
        description: 'Um fim de semana de renovação espiritual, conexão com Deus e com outros jovens da nossa comunidade!',
        location: 'Sítio Bênção de Deus - Estrada Rural, km 5',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14, 8, 0),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 16, 18, 0),
        type: 'evento',
        createdBy: admin.id,
      },
      {
        title: 'Célula - Família e Propósito',
        description: 'Encontro semanal de célula com discussão sobre família e o propósito de Deus para nossas vidas.',
        location: 'Casa da Família Santos',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 20, 0),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 22, 0),
        type: 'celula',
        isRecurring: true,
        createdBy: admin.id,
      },
    ],
  });

  console.log('✅ Eventos criados');

  // Avisos
  await prisma.announcement.createMany({
    skipDuplicates: true,
    data: [
      {
        title: '📣 Bem-vindos ao QMD App!',
        content: 'Que alegria ter você aqui! O QMD App é o seu espaço digital para se conectar com Deus e com nossa comunidade. Explore os devocionais, envie pedidos de oração e fique por dentro de tudo que acontece na nossa igreja!',
        isPinned: true,
        isActive: true,
        createdBy: admin.id,
      },
      {
        title: '🎉 Conferência Anual QMD 2024',
        content: 'A Conferência Anual da Igreja QMD está chegando! Prepare seu coração para dias de renovação, palavra poderosa e milagres. Aguarde mais informações em breve!',
        isPinned: false,
        isActive: true,
        createdBy: admin.id,
      },
      {
        title: '🙏 Semana de Oração',
        content: 'De segunda a sexta, das 7h às 8h, teremos nossa Semana de Oração. Venha se juntar a nós presencialmente ou acompanhe pelo YouTube. Sua presença faz a diferença!',
        isPinned: false,
        isActive: true,
        createdBy: admin.id,
      },
    ],
  });

  console.log('✅ Avisos criados');

  // Pedidos de oração
  await prisma.prayerRequest.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: member.id,
        authorName: 'João da Silva',
        title: 'Oração pela saúde da minha mãe',
        description: 'Minha mãe está passando por um tratamento médico difícil. Peço a oração de toda a família QMD para que Deus a cure e dê forças à família.',
        isAnonymous: false,
        visibility: 'PUBLIC',
        isApproved: true,
      },
      {
        authorName: 'Anônimo',
        title: 'Necessidade de emprego',
        description: 'Estou há 6 meses sem emprego e preciso de fé e de oportunidade. Oro que Deus abra portas para eu prover minha família.',
        isAnonymous: true,
        visibility: 'PUBLIC',
        isApproved: true,
      },
      {
        authorName: 'Anônimo',
        title: 'Restauração do casamento',
        description: 'Estou passando por dificuldades no casamento e preciso de oração para que Deus restaure nossa família.',
        isAnonymous: true,
        visibility: 'PUBLIC',
        isApproved: true,
      },
    ],
  });

  console.log('✅ Pedidos de oração criados');

  // Testemunhos
  await prisma.testimony.createMany({
    skipDuplicates: true,
    data: [
      {
        userId: member.id,
        authorName: 'João da Silva',
        title: 'Deus me livrou da depressão',
        content: 'Por anos lutei contra a depressão, achando que nunca ficaria bem. Mas quando encontrei a QMD e comecei a buscar a Deus com tudo, Ele transformou minha vida completamente. Hoje vivo com alegria e propósito!',
        isAnonymous: false,
        isApproved: true,
        approvedAt: new Date(),
      },
      {
        authorName: 'Maria S.',
        title: 'Milagre de cura na família',
        content: 'Meu filho estava com um diagnóstico muito difícil. A comunidade da QMD orou por ele durante semanas. No retorno ao médico, os exames não mostraram mais nada. Glória a Deus!',
        isAnonymous: false,
        isApproved: true,
        approvedAt: new Date(),
      },
    ],
  });

  console.log('✅ Testemunhos criados');

  // Configurações
  await prisma.setting.createMany({
    skipDuplicates: true,
    data: [
      { key: 'church_name', value: 'Igreja QMD – Quero Mais de Deus' },
      { key: 'church_address', value: 'Rua das Flores, 123 - São Paulo, SP' },
      { key: 'church_phone', value: '(11) 99999-9999' },
      { key: 'church_email', value: 'contato@qmd.com' },
      { key: 'youtube_channel', value: 'https://youtube.com/@qmd' },
      { key: 'instagram', value: '@igrejaqmd' },
      { key: 'whatsapp', value: '5511999999999' },
    ],
  });

  console.log('✅ Configurações criadas');
  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('\n📋 Credenciais de teste:');
  console.log('   Admin:  admin@qmd.com / Admin@123');
  console.log('   Pastor: pastor@qmd.com / Pastor@123');
  console.log('   Membro: membro@qmd.com / Membro@123');
}

main()
  .catch((e) => { console.error('❌ Erro no seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
