const router = require('express').Router();
const ctrl = require('../controllers/events');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isLeaderOrAdmin } = require('../middleware/permissions');

router.get('/upcoming', ctrl.getUpcoming);
router.get('/', ctrl.getAll);
router.get('/:id', optionalAuth, ctrl.getById);
router.post('/', authenticate, isLeaderOrAdmin, ctrl.create);
router.put('/:id', authenticate, isLeaderOrAdmin, ctrl.update);
router.delete('/:id', authenticate, isLeaderOrAdmin, ctrl.remove);
router.post('/:id/confirm', authenticate, ctrl.confirm);

module.exports = router;
