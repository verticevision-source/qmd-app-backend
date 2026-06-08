const { error } = require('../utils/response');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return error(res, 'Não autenticado', 401);
  if (!roles.includes(req.user.role)) return error(res, 'Sem permissão para esta ação', 403);
  next();
};

const isAdmin = requireRole('ADMIN');
const isLeaderOrAdmin = requireRole('LEADER', 'ADMIN');
const isAny = requireRole('MEMBER', 'LEADER', 'ADMIN');

module.exports = { requireRole, isAdmin, isLeaderOrAdmin, isAny };
