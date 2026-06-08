const router = require('express').Router();
const ctrl = require('../controllers/testimonies');
const { authenticate } = require('../middleware/auth');
const { isLeaderOrAdmin } = require('../middleware/permissions');

router.get('/', ctrl.getApproved);
router.get('/admin', authenticate, isLeaderOrAdmin, ctrl.getAllAdmin);
router.post('/', authenticate, ctrl.create);
router.patch('/:id/approve', authenticate, isLeaderOrAdmin, ctrl.approve);
router.delete('/:id', authenticate, isLeaderOrAdmin, ctrl.reject);

module.exports = router;
