const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/verses', require('./verses'));
router.use('/devotionals', require('./devotionals'));
router.use('/prayers', require('./prayers'));
router.use('/messages', require('./messages'));
router.use('/testimonies', require('./testimonies'));
router.use('/events', require('./events'));
router.use('/sermons', require('./sermons'));
router.use('/announcements', require('./announcements'));
router.use('/pastoral', require('./pastoral'));
router.use('/admin', require('./admin'));

module.exports = router;
