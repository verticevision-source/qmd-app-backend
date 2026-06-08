const router = require('express').Router();
const ctrl = require('../controllers/devotionals');
const { authenticate } = require('../middleware/auth');
const { isLeaderOrAdmin } = require('../middleware/permissions');

router.get('/themes', ctrl.getThemes);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authenticate, isLeaderOrAdmin, ctrl.create);
router.put('/:id', authenticate, isLeaderOrAdmin, ctrl.update);
router.delete('/:id', authenticate, isLeaderOrAdmin, ctrl.remove);

module.exports = router;
