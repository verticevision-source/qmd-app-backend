const { PrismaClient } = require('@prisma/client');
const { success, error, paginated } = require('../utils/response');
const prisma = new PrismaClient();

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const where = { isPublished: true };
    const [items, total] = await Promise.all([
      prisma.pastoralMessage.findMany({ where, skip: Number(skip), take: Number(limit), orderBy: { publishedAt: 'desc' } }),
      prisma.pastoralMessage.count({ where }),
    ]);
    return paginated(res, items, total, page, limit);
  } catch (err) { return error(res, 'Erro ao buscar mensagens', 500); }
};

const getLatest = async (req, res) => {
  try {
    const item = await prisma.pastoralMessage.findFirst({ where: { isPublished: true }, orderBy: { publishedAt: 'desc' } });
    return success(res, item);
  } catch (err) { return error(res, 'Erro ao buscar mensagem', 500); }
};

const create = async (req, res) => {
  try {
    const { title, content, imageUrl } = req.body;
    if (!title || !content) return error(res, 'Título e conteúdo são obrigatórios', 400);
    const item = await prisma.pastoralMessage.create({ data: { title, content, imageUrl, authorName: req.user.name, authorId: req.user.id } });
    return success(res, item, 'Mensagem criada!', 201);
  } catch (err) { return error(res, 'Erro ao criar mensagem', 500); }
};

const update = async (req, res) => {
  try {
    const item = await prisma.pastoralMessage.update({ where: { id: req.params.id }, data: req.body });
    return success(res, item, 'Mensagem atualizada!');
  } catch (err) { return error(res, 'Erro ao atualizar mensagem', 500); }
};

const remove = async (req, res) => {
  try {
    await prisma.pastoralMessage.delete({ where: { id: req.params.id } });
    return success(res, null, 'Mensagem removida!');
  } catch (err) { return error(res, 'Erro ao remover mensagem', 500); }
};

module.exports = { getAll, getLatest, create, update, remove };
