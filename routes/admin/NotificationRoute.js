const express = require('express');
const router = express.Router();

const { getNotifications, markAsRead, markAllAsRead } = require('../../controllers/NotificationController');
const { authenticateUser } = require('../../middlewares/authorizedUsers');

router.get('/', authenticateUser, getNotifications);
router.post('/:id/read', authenticateUser, markAsRead);
router.post('/mark-all-read', authenticateUser, markAllAsRead);

module.exports = router;