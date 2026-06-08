const { PrismaClient } = require('@prisma/client');
const { success, error, paginated } = require('../utils/response');
const { hash } = require('../utils/password');

const prisma = new PrismaClient();

const getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const skip = (page - 1) * limit;
    const where = {
      ...(search && { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }),
      ...(role && { role }),
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, skip: Number(skip), take: Number(limit), orderBy: { name: 'asc' },
        select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, isActive: true, memberSince: true, createdAt: true } }),
      prisma.user.count({ where }),
    ]);
    return paginated(res, users, total, page, limit);
  } catch (err) {
    return error(res, 'Erro ao buscar usuários', 500);
  }
};

const getById = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { profile: true },
      select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, isActive: true, memberSince: true, birthDate: true, createdAt: true, profile: true },
    });
    if (!user) return error(res, 'Usuário não encontrado', 404);
    return success(res, user);
  } catch (err) {
    return error(res, 'Erro ao buscar usuário', 500);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, birthDate, bio, address, baptized, ministry } = req.body;
    const userId = req.params.id || req.user.id;
    if (userId !== req.user.id && req.user.role === 'MEMBER') return error(res, 'Sem permissão', 403);
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone !== undefined && { phone }),
        ...(birthDate && { birthDate: new Date(birthDate) }),
        profile: { upsert: { create: { bio, address, baptized: baptized ?? false, ministry }, update: { bio, address, baptized, ministry } } },
      },
      include: { profile: true },
      select: { id: true, name: true, email: true, phone: true, role: true, avatar: true, memberSince: true, birthDate: true, profile: true },
    });
    return success(res, user, 'Perfil atualizado com sucesso!');
  } catch (err) {
    return error(res, 'Erro ao atualizar perfil', 500);
  }
};

const updateRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['MEMBER', 'LEADER', 'ADMIN'].includes(role)) return error(res, 'Papel inválido', 400);
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { role },
      select: { id: true, name: true, email: true, role: true } });
    return success(res, user, 'Papel atualizado!');
  } catch (err) {
    return error(res, 'Erro ao atualizar papel', 500);
  }
};

const toggleActive = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return error(res, 'Usuário não encontrado', 404);
    const updated = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: !user.isActive },
      select: { id: true, name: true, isActive: true } });
    return success(res, updated, `Usuário ${updated.isActive ? 'ativado' : 'desativado'}!`);
  } catch (err) {
    return error(res, 'Erro ao atualizar usuário', 500);
  }
};

const getStats = async (req, res) => {
  try {
    const [total, members, leaders, admins, recent] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'MEMBER' } }),
      prisma.user.count({ where: { role: 'LEADER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
    ]);
    return success(res, { total, members, leaders, admins, recentJoined: recent });
  } catch (err) {
    return error(res, 'Erro ao buscar estatísticas', 500);
  }
};

module.exports = { getAll, getById, updateProfile, updateRole, toggleActive, getStats };
