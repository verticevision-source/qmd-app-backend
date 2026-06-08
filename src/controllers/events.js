const { PrismaClient } = require('@prisma/client');
const { success, error, paginated } = require('../utils/response');
const prisma = new PrismaClient();

const getUpcoming = async (req, res) => {
  try {
    const { limit = 10, type } = req.query;
    const where = { isActive: true, startDate: { gte: new Date() }, ...(type && { type }) };
    const items = await prisma.event.findMany({ where, take: Number(limit), orderBy: { startDate: 'asc' },
      include: { _count: { select: { confirmations: true } } } });
    return success(res, items);
  } catch (err) { return error(res, 'Erro ao buscar eventos', 500); }
};

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const skip = (page - 1) * limit;
    const where = { isActive: true, ...(type && { type }) };
    const [items, total] = await Promise.all([
      prisma.event.findMany({ where, skip: Number(skip), take: Number(limit), orderBy: { startDate: 'asc' }, include: { _count: { select: { confirmations: true } } } }),
      prisma.event.count({ where }),
    ]);
    return paginated(res, items, total, page, limit);
  } catch (err) { return error(res, 'Erro ao buscar eventos', 500); }
};

const getById = async (req, res) => {
  try {
    const item = await prisma.event.findUnique({ where: { id: req.params.id }, include: { _count: { select: { confirmations: true } } } });
    if (!item) return error(res, 'Evento não encontrado', 404);
    let confirmed = false;
    if (req.user) {
      const conf = await prisma.eventConfirmation.findUnique({ where: { userId_eventId: { userId: req.user.id, eventId: req.params.id } } });
      confirmed = !!conf;
    }
    return success(res, { ...item, confirmed });
  } catch (err) { return error(res, 'Erro ao buscar evento', 500); }
};

const create = async (req, res) => {
  try {
    const { title, description, location, startDate, endDate, type, streamUrl, imageUrl, isRecurring } = req.body;
    if (!title || !startDate) return error(res, 'Título e data são obrigatórios', 400);
    const item = await prisma.event.create({ data: { title, description, location, startDate: new Date(startDate), endDate: endDate ? new Date(endDate) : null, type, streamUrl, imageUrl, isRecurring: isRecurring || false, createdBy: req.user.id } });
    return success(res, item, 'Evento criado!', 201);
  } catch (err) { return error(res, 'Erro ao criar evento', 500); }
};

const update = async (req, res) => {
  try {
    const { startDate, endDate, ...rest } = req.body;
    const item = await prisma.event.update({ where: { id: req.params.id }, data: { ...rest, ...(startDate && { startDate: new Date(startDate) }), ...(endDate && { endDate: new Date(endDate) }) } });
    return success(res, item, 'Evento atualizado!');
  } catch (err) { return error(res, 'Erro ao atualizar evento', 500); }
};

const remove = async (req, res) => {
  try {
    await prisma.event.update({ where: { id: req.params.id }, data: { isActive: false } });
    return success(res, null, 'Evento removido!');
  } catch (err) { return error(res, 'Erro ao remover evento', 500); }
};

const confirm = async (req, res) => {
  try {
    if (!req.user) return error(res, 'Login necessário', 401);
    const existing = await prisma.eventConfirmation.findUnique({ where: { userId_eventId: { userId: req.user.id, eventId: req.params.id } } });
    if (existing) {
      await prisma.eventConfirmation.delete({ where: { id: existing.id } });
      return success(res, { confirmed: false }, 'Confirmação removida');
    }
    await prisma.eventConfirmation.create({ data: { userId: req.user.id, eventId: req.params.id } });
    return success(res, { confirmed: true }, 'Presença confirmada!');
  } catch (err) { return error(res, 'Erro ao confirmar presença', 500); }
};

module.exports = { getUpcoming, getAll, getById, create, update, remove, confirm };
