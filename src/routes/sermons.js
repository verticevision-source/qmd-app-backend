const router = require('express').Router();
const ctrl = require('../controllers/sermons');
const { authenticate } = require('../middleware/auth');
const { isLeaderOrAdmin } = require('../middleware/permissions');

router.get('/live', ctrl.getLive);
router.get('/categories', ctrl.getCategories);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authenticate, isLeaderOrAdmin, ctrl.create);
router.put('/:id', authenticate, isLeaderOrAdmin, ctrl.update);
router.delete('/:id', authenticate, isLeaderOrAdmin, ctrl.remove);

module.exports = router;
