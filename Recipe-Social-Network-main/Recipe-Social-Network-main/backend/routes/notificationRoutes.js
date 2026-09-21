const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, notificationController.getNotifications);
router.put('/read', authMiddleware, notificationController.markAsRead);
router.get('/dashboard', authMiddleware, notificationController.getDashboardStats);
router.get('/charts', authMiddleware, notificationController.getAnalyticsCharts);

module.exports = router;
