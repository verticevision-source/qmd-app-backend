const router = require('express').Router();
const ctrl = require('../controllers/users');
const { authenticate } = require('../middleware/auth');
const { isAdmin, isLeaderOrAdmin } = require('../middleware/permissions');

router.get('/', authenticate, isAdmin, ctrl.getAll);
router.get('/stats', authenticate, isAdmin, ctrl.getStats);
router.get('/:id', authenticate, ctrl.getById);
router.put('/:id', authenticate, ctrl.updateProfile);
router.patch('/:id/role', authenticate, isAdmin, ctrl.updateRole);
router.patch('/:id/toggle', authenticate, isAdmin, ctrl.toggleActive);

module.exports = router;
