const { PrismaClient } = require('@prisma/client');
const { success, error, paginated } = require('../utils/response');
const prisma = new PrismaClient();

const getMyMessages = async (req, res) => {
  try {
    const items = await prisma.leadershipMessage.findMany({
      where: { senderId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { replies: { include: { author: { select: { id: true, name: true, avatar: true, role: true } } }, orderBy: { createdAt: 'asc' } } },
    });
    return success(res, items);
  } catch (err) { return error(res, 'Erro ao buscar mensagens', 500); }
};

const create = async (req, res) => {
  try {
    const { subject, message, isAnonymous = false, category = 'general' } = req.body;
    if (!subject || !message) return error(res, 'Assunto e mensagem são obrigatórios', 400);
    const item = await prisma.leadershipMessage.create({
      data: {
        subject, message, isAnonymous, category,
        senderId: req.user?.id || null,
        senderName: isAnonymous ? 'Anônimo' : req.user?.name,
        status: 'SENT',
      },
    });
    return success(res, item, 'Mensagem enviada com sucesso!', 201);
  } catch (err) { return error(res, 'Erro ao enviar mensagem', 500); }
};

const getAllForLeadership = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, category } = req.query;
    const skip = (page - 1) * limit;
    const where = {
      ...(status && { status }),
      ...(category && { category }),
    };
    const [items, total] = await Promise.all([
      prisma.leadershipMessage.findMany({
        where, skip: Number(skip), take: Number(limit), orderBy: { createdAt: 'desc' },
        include: { replies: { include: { author: { select: { id: true, name: true, role: true } } } } },
      }),
      prisma.leadershipMessage.count({ where }),
    ]);
    return paginated(res, items, total, page, limit);
  } catch (err) { return error(res, 'Erro ao buscar mensagens', 500); }
};

const reply = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return error(res, 'Conteúdo da resposta é obrigatório', 400);
    await prisma.leadershipMessage.update({ where: { id: req.params.id }, data: { status: 'ANSWERED', leaderId: req.user.id } });
    const replyItem = await prisma.messageReply.create({
      data: { messageId: req.params.id, authorId: req.user.id, content },
      include: { author: { select: { id: true, name: true, avatar: true, role: true } } },
    });
    return success(res, replyItem, 'Resposta enviada!', 201);
  } catch (err) { return error(res, 'Erro ao responder mensagem', 500); }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const item = await prisma.leadershipMessage.update({ where: { id: req.params.id }, data: { status } });
    return success(res, item, 'Status atualizado!');
  } catch (err) { return error(res, 'Erro ao atualizar status', 500); }
};

module.exports = { getMyMessages, create, getAllForLeadership, reply, updateStatus };
