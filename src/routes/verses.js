const router = require('express').Router();
const ctrl = require('../controllers/verses');
const { authenticate } = require('../middleware/auth');
const { isLeaderOrAdmin } = require('../middleware/permissions');

router.get('/today', ctrl.getToday);
router.get('/', ctrl.getAll);
router.post('/', authenticate, isLeaderOrAdmin, ctrl.create);
router.put('/:id', authenticate, isLeaderOrAdmin, ctrl.update);
router.delete('/:id', authenticate, isLeaderOrAdmin, ctrl.remove);

module.exports = router;
