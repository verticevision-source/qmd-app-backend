const router = require('express').Router();
const ctrl = require('../controllers/announcements');
const { authenticate } = require('../middleware/auth');
const { isLeaderOrAdmin } = require('../middleware/permissions');

router.get('/', ctrl.getActive);
router.get('/all', authenticate, isLeaderOrAdmin, ctrl.getAll);
router.post('/', authenticate, isLeaderOrAdmin, ctrl.create);
router.put('/:id', authenticate, isLeaderOrAdmin, ctrl.update);
router.delete('/:id', authenticate, isLeaderOrAdmin, ctrl.remove);

module.exports = router;
