const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/response');
const prisma = new PrismaClient();

const getDashboard = async (req, res) => {
  try {
    const [
      totalMembers, totalPrayers, pendingCounseling, upcomingEvents,
      totalDevotionals, totalSermons, pendingTestimonies, recentMembers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.prayerRequest.count(),
      prisma.leadershipMessage.count({ where: { status: { in: ['SENT', 'REVIEWING'] } } }),
      prisma.event.count({ where: { startDate: { gte: new Date() }, isActive: true } }),
      prisma.devotional.count({ where: { isPublished: true } }),
      prisma.sermon.count({ where: { isPublished: true } }),
      prisma.testimony.count({ where: { isApproved: false } }),
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    ]);
    return success(res, { totalMembers, totalPrayers, pendingCounseling, upcomingEvents, totalDevotionals, totalSermons, pendingTestimonies, recentMembers });
  } catch (err) { return error(res, 'Erro ao buscar dashboard', 500); }
};

const getSettings = async (req, res) => {
  try {
    const settings = await prisma.setting.findMany();
    const obj = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
    return success(res, obj);
  } catch (err) { return error(res, 'Erro ao buscar configurações', 500); }
};

const updateSettings = async (req, res) => {
  try {
    const updates = Object.entries(req.body).map(([key, value]) =>
      prisma.setting.upsert({ where: { key }, update: { value: String(value) }, create: { key, value: String(value) } })
    );
    await Promise.all(updates);
    return success(res, null, 'Configurações salvas!');
  } catch (err) { return error(res, 'Erro ao salvar configurações', 500); }
};

module.exports = { getDashboard, getSettings, updateSettings };
