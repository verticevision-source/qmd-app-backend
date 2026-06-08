const { PrismaClient } = require('@prisma/client');
const { success, error, paginated } = require('../utils/response');
const prisma = new PrismaClient();

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const skip = (page - 1) * limit;
    const where = { isApproved: true, visibility: 'PUBLIC' };
    const [items, total] = await Promise.all([
      prisma.prayerRequest.findMany({
        where, skip: Number(skip), take: Number(limit), orderBy: { createdAt: 'desc' },
        include: { _count: { select: { intercessions: true } } },
      }),
      prisma.prayerRequest.count({ where }),
    ]);
    const safe = items.map(p => ({
      ...p,
      authorName: p.isAnonymous ? 'Anônimo' : (p.authorName || 'Membro'),
      userId: p.isAnonymous ? null : p.userId,
    }));
    return paginated(res, safe, total, page, limit);
  } catch (err) { return error(res, 'Erro ao buscar pedidos', 500); }
};

const getMyRequests = async (req, res) => {
  try {
    const items = await prisma.prayerRequest.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { intercessions: true } } },
    });
    return success(res, items);
  } catch (err) { return error(res, 'Erro ao buscar seus pedidos', 500); }
};

const create = async (req, res) => {
  try {
    const { title, description, isAnonymous = false, visibility = 'PUBLIC' } = req.body;
    if (!title || !description) return error(res, 'Título e descrição são obrigatórios', 400);
    const item = await prisma.prayerRequest.create({
      data: {
        title, description, isAnonymous, visibility,
        userId: req.user?.id || null,
        authorName: isAnonymous ? 'Anônimo' : req.user?.name,
        isApproved: true,
      },
    });
    return success(res, item, 'Pedido de oração enviado!', 201);
  } catch (err) { return error(res, 'Erro ao criar pedido', 500); }
};

const intercede = async (req, res) => {
  try {
    if (!req.user) return error(res, 'Login necessário', 401);
    const existing = await prisma.prayerIntercession.findUnique({
      where: { userId_requestId: { userId: req.user.id, requestId: req.params.id } },
    });
    if (existing) {
      await prisma.prayerIntercession.delete({ where: { id: existing.id } });
      return success(res, { praying: false }, 'Removido da oração');
    }
    await prisma.prayerIntercession.create({ data: { userId: req.user.id, requestId: req.params.id } });
    return success(res, { praying: true }, 'Estou orando por você!');
  } catch (err) { return error(res, 'Erro ao registrar oração', 500); }
};

const getAllAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, approved } = req.query;
    const skip = (page - 1) * limit;
    const where = approved !== undefined ? { isApproved: approved === 'true' } : {};
    const [items, total] = await Promise.all([
      prisma.prayerRequest.findMany({ where, skip: Number(skip), take: Number(limit), orderBy: { createdAt: 'desc' }, include: { _count: { select: { intercessions: true } } } }),
      prisma.prayerRequest.count({ where }),
    ]);
    return paginated(res, items, total, page, limit);
  } catch (err) { return error(res, 'Erro ao buscar pedidos', 500); }
};

const markAnswered = async (req, res) => {
  try {
    const item = await prisma.prayerRequest.update({ where: { id: req.params.id }, data: { answeredAt: new Date() } });
    return success(res, item, 'Pedido marcado como respondido!');
  } catch (err) { return error(res, 'Erro ao atualizar pedido', 500); }
};

module.exports = { getAll, getMyRequests, create, intercede, getAllAdmin, markAnswered };
