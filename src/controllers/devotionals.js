const { PrismaClient } = require('@prisma/client');
const { success, error, paginated } = require('../utils/response');
const prisma = new PrismaClient();

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, theme, search } = req.query;
    const skip = (page - 1) * limit;
    const where = {
      isPublished: true,
      ...(theme && { theme }),
      ...(search && { OR: [{ title: { contains: search, mode: 'insensitive' } }, { content: { contains: search, mode: 'insensitive' } }] }),
    };
    const [items, total] = await Promise.all([
      prisma.devotional.findMany({ where, skip: Number(skip), take: Number(limit), orderBy: { publishedAt: 'desc' } }),
      prisma.devotional.count({ where }),
    ]);
    return paginated(res, items, total, page, limit);
  } catch (err) { return error(res, 'Erro ao buscar devocionais', 500); }
};

const getById = async (req, res) => {
  try {
    const item = await prisma.devotional.findUnique({ where: { id: req.params.id } });
    if (!item) return error(res, 'Devocional não encontrado', 404);
    return success(res, item);
  } catch (err) { return error(res, 'Erro ao buscar devocional', 500); }
};

const getThemes = async (req, res) => {
  try {
    const themes = await prisma.devotional.findMany({ where: { isPublished: true }, select: { theme: true }, distinct: ['theme'] });
    return success(res, themes.map(t => t.theme));
  } catch (err) { return error(res, 'Erro ao buscar temas', 500); }
};

const create = async (req, res) => {
  try {
    const { title, theme, content, verseRef, verseText, imageUrl, authorName } = req.body;
    if (!title || !theme || !content) return error(res, 'Título, tema e conteúdo são obrigatórios', 400);
    const item = await prisma.devotional.create({
      data: { title, theme, content, verseRef, verseText, imageUrl, authorName: authorName || req.user.name, isPublished: true }
    });
    return success(res, item, 'Devocional criado!', 201);
  } catch (err) { return error(res, 'Erro ao criar devocional', 500); }
};

const update = async (req, res) => {
  try {
    const item = await prisma.devotional.update({ where: { id: req.params.id }, data: req.body });
    return success(res, item, 'Devocional atualizado!');
  } catch (err) { return error(res, 'Erro ao atualizar devocional', 500); }
};

const remove = async (req, res) => {
  try {
    await prisma.devotional.delete({ where: { id: req.params.id } });
    return success(res, null, 'Devocional removido!');
  } catch (err) { return error(res, 'Erro ao remover devocional', 500); }
};

module.exports = { getAll, getById, getThemes, create, update, remove };
