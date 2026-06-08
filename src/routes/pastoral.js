const router = require('express').Router();
const ctrl = require('../controllers/pastoral');
const { authenticate } = require('../middleware/auth');
const { isLeaderOrAdmin } = require('../middleware/permissions');

router.get('/latest', ctrl.getLatest);
router.get('/', ctrl.getAll);
router.post('/', authenticate, isLeaderOrAdmin, ctrl.create);
router.put('/:id', authenticate, isLeaderOrAdmin, ctrl.update);
router.delete('/:id', authenticate, isLeaderOrAdmin, ctrl.remove);

module.exports = router;
