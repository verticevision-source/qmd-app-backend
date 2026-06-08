const { PrismaClient } = require('@prisma/client');
const { success, error, paginated } = require('../utils/response');
const prisma = new PrismaClient();

const getActive = async (req, res) => {
  try {
    const items = await prisma.announcement.findMany({
      where: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });
    return success(res, items);
  } catch (err) { return error(res, 'Erro ao buscar avisos', 500); }
};

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      prisma.announcement.findMany({ skip: Number(skip), take: Number(limit), orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }] }),
      prisma.announcement.count(),
    ]);
    return paginated(res, items, total, page, limit);
  } catch (err) { return error(res, 'Erro ao buscar avisos', 500); }
};

const create = async (req, res) => {
  try {
    const { title, content, imageUrl, isPinned, expiresAt } = req.body;
    if (!title || !content) return error(res, 'Título e conteúdo são obrigatórios', 400);
    const item = await prisma.announcement.create({ data: { title, content, imageUrl, isPinned: isPinned || false, expiresAt: expiresAt ? new Date(expiresAt) : null, createdBy: req.user.id } });
    return success(res, item, 'Aviso criado!', 201);
  } catch (err) { return error(res, 'Erro ao criar aviso', 500); }
};

const update = async (req, res) => {
  try {
    const { expiresAt, ...rest } = req.body;
    const item = await prisma.announcement.update({ where: { id: req.params.id }, data: { ...rest, ...(expiresAt && { expiresAt: new Date(expiresAt) }) } });
    return success(res, item, 'Aviso atualizado!');
  } catch (err) { return error(res, 'Erro ao atualizar aviso', 500); }
};

const remove = async (req, res) => {
  try {
    await prisma.announcement.delete({ where: { id: req.params.id } });
    return success(res, null, 'Aviso removido!');
  } catch (err) { return error(res, 'Erro ao remover aviso', 500); }
};

module.exports = { getActive, getAll, create, update, remove };
