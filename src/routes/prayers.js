const router = require('express').Router();
const ctrl = require('../controllers/prayers');
const { authenticate, optionalAuth } = require('../middleware/auth');
const { isLeaderOrAdmin } = require('../middleware/permissions');

router.get('/', ctrl.getAll);
router.get('/mine', authenticate, ctrl.getMyRequests);
router.get('/admin', authenticate, isLeaderOrAdmin, ctrl.getAllAdmin);
router.post('/', authenticate, ctrl.create);
router.post('/:id/intercede', optionalAuth, ctrl.intercede);
router.patch('/:id/answered', authenticate, isLeaderOrAdmin, ctrl.markAnswered);

module.exports = router;
