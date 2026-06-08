const router = require('express').Router();
const ctrl = require('../controllers/auth');
const { authenticate } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/me', authenticate, ctrl.me);
router.put('/password', authenticate, ctrl.updatePassword);

module.exports = router;
