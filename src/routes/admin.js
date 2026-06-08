const router = require('express').Router();
const ctrl = require('../controllers/admin');
const { authenticate } = require('../middleware/auth');
const { isAdmin } = require('../middleware/permissions');

router.get('/dashboard', authenticate, isAdmin, ctrl.getDashboard);
router.get('/settings', authenticate, isAdmin, ctrl.getSettings);
router.put('/settings', authenticate, isAdmin, ctrl.updateSettings);

module.exports = router;
