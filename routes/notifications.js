const express = require('express');
const {
  setReminder,
  getReminder,
  removeReminder,
  getNotifications,
  markAsRead
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');
const { validateReminder } = require('../middleware/validation');

const router = express.Router();

router.use(protect); // All routes are protected

router.post('/reminder', validateReminder, setReminder);
router.get('/reminder', getReminder);
router.delete('/reminder', removeReminder);
router.get('/', getNotifications);
router.put('/:id/read', markAsRead);

module.exports = router;
