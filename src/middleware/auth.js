const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { error } = require('../utils/response');

const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Token não fornecido', 401);
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, isActive: true, avatar: true },
    });
    if (!user || !user.isActive) return error(res, 'Usuário não encontrado ou inativo', 401);
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') return error(res, 'Token expirado', 401);
    if (err.name === 'JsonWebTokenError') return error(res, 'Token inválido', 401);
    return error(res, 'Erro de autenticação', 500);
  }
};

const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return next();
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });
    if (user && user.isActive) req.user = user;
  } catch (_) {}
  next();
};

module.exports = { authenticate, optionalAuth };
