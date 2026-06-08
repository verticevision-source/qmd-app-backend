const router = require('express').Router();
const ctrl = require('../controllers/messages');
const { authenticate } = require('../middleware/auth');
const { isLeaderOrAdmin } = require('../middleware/permissions');

router.get('/mine', authenticate, ctrl.getMyMessages);
router.get('/leadership', authenticate, isLeaderOrAdmin, ctrl.getAllForLeadership);
router.post('/', authenticate, ctrl.create);
router.post('/:id/reply', authenticate, isLeaderOrAdmin, ctrl.reply);
router.patch('/:id/status', authenticate, isLeaderOrAdmin, ctrl.updateStatus);

module.exports = router;
