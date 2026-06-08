const { PrismaClient } = require('@prisma/client');
const { success, error, paginated } = require('../utils/response');
const prisma = new PrismaClient();

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 12, categoryId, preacher, search } = req.query;
    const skip = (page - 1) * limit;
    const where = {
      isPublished: true,
      ...(categoryId && { categoryId }),
      ...(preacher && { preacher: { contains: preacher, mode: 'insensitive' } }),
      ...(search && { OR: [{ title: { contains: search, mode: 'insensitive' } }, { preacher: { contains: search, mode: 'insensitive' } }] }),
    };
    const [items, total] = await Promise.all([
      prisma.sermon.findMany({ where, skip: Number(skip), take: Number(limit), orderBy: { publishedAt: 'desc' }, include: { category: true } }),
      prisma.sermon.count({ where }),
    ]);
    return paginated(res, items, total, page, limit);
  } catch (err) { return error(res, 'Erro ao buscar sermões', 500); }
};

const getById = async (req, res) => {
  try {
    const item = await prisma.sermon.findUnique({ where: { id: req.params.id }, include: { category: true } });
    if (!item) return error(res, 'Sermão não encontrado', 404);
    return success(res, item);
  } catch (err) { return error(res, 'Erro ao buscar sermão', 500); }
};

const getLive = async (req, res) => {
  try {
    const item = await prisma.sermon.findFirst({ where: { isLive: true, isPublished: true } });
    return success(res, item);
  } catch (err) { return error(res, 'Erro ao buscar transmissão', 500); }
};

const getCategories = async (req, res) => {
  try {
    const cats = await prisma.sermonCategory.findMany({ orderBy: { name: 'asc' } });
    return success(res, cats);
  } catch (err) { return error(res, 'Erro ao buscar categorias', 500); }
};

const create = async (req, res) => {
  try {
    const { title, description, preacher, categoryId, videoUrl, thumbnailUrl, verses, duration, isLive } = req.body;
    if (!title || !preacher) return error(res, 'Título e pregador são obrigatórios', 400);
    const item = await prisma.sermon.create({ data: { title, description, preacher, categoryId, videoUrl, thumbnailUrl, verses, duration, isLive: isLive || false, isPublished: true } });
    return success(res, item, 'Sermão cadastrado!', 201);
  } catch (err) { return error(res, 'Erro ao cadastrar sermão', 500); }
};

const update = async (req, res) => {
  try {
    const item = await prisma.sermon.update({ where: { id: req.params.id }, data: req.body });
    return success(res, item, 'Sermão atualizado!');
  } catch (err) { return error(res, 'Erro ao atualizar sermão', 500); }
};

const remove = async (req, res) => {
  try {
    await prisma.sermon.delete({ where: { id: req.params.id } });
    return success(res, null, 'Sermão removido!');
  } catch (err) { return error(res, 'Erro ao remover sermão', 500); }
};

module.exports = { getAll, getById, getLive, getCategories, create, update, remove };
