const { PrismaClient } = require('@prisma/client');
const { success, error, paginated } = require('../utils/response');
const prisma = new PrismaClient();

const getApproved = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const where = { isApproved: true };
    const [items, total] = await Promise.all([
      prisma.testimony.findMany({ where, skip: Number(skip), take: Number(limit), orderBy: { approvedAt: 'desc' } }),
      prisma.testimony.count({ where }),
    ]);
    const safe = items.map(t => ({ ...t, authorName: t.isAnonymous ? 'Anônimo' : t.authorName, userId: t.isAnonymous ? null : t.userId }));
    return paginated(res, safe, total, page, limit);
  } catch (err) { return error(res, 'Erro ao buscar testemunhos', 500); }
};

const create = async (req, res) => {
  try {
    const { title, content, isAnonymous = false } = req.body;
    if (!title || !content) return error(res, 'Título e conteúdo são obrigatórios', 400);
    const item = await prisma.testimony.create({
      data: { title, content, isAnonymous, userId: req.user?.id || null, authorName: isAnonymous ? 'Anônimo' : req.user?.name, isApproved: false },
    });
    return success(res, item, 'Testemunho enviado para aprovação!', 201);
  } catch (err) { return error(res, 'Erro ao enviar testemunho', 500); }
};

const getAllAdmin = async (req, res) => {
  try {
    const { page = 1, limit = 20, approved } = req.query;
    const skip = (page - 1) * limit;
    const where = approved !== undefined ? { isApproved: approved === 'true' } : {};
    const [items, total] = await Promise.all([
      prisma.testimony.findMany({ where, skip: Number(skip), take: Number(limit), orderBy: { createdAt: 'desc' } }),
      prisma.testimony.count({ where }),
    ]);
    return paginated(res, items, total, page, limit);
  } catch (err) { return error(res, 'Erro ao buscar testemunhos', 500); }
};

const approve = async (req, res) => {
  try {
    const item = await prisma.testimony.update({
      where: { id: req.params.id },
      data: { isApproved: true, approvedBy: req.user.id, approvedAt: new Date() },
    });
    return success(res, item, 'Testemunho aprovado!');
  } catch (err) { return error(res, 'Erro ao aprovar testemunho', 500); }
};

const reject = async (req, res) => {
  try {
    await prisma.testimony.delete({ where: { id: req.params.id } });
    return success(res, null, 'Testemunho rejeitado e removido.');
  } catch (err) { return error(res, 'Erro ao rejeitar testemunho', 500); }
};

module.exports = { getApproved, create, getAllAdmin, approve, reject };
