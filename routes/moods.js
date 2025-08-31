const express = require('express');
const {
  createMood,
  getDailyMood,
  getMoodHistory,
  getAverageMood
} = require('../controllers/moodController');
const { protect } = require('../middleware/auth');
const { validateMood } = require('../middleware/validation');

const router = express.Router();

router.use(protect); // All routes are protected

router.post('/', validateMood, createMood);
router.get('/daily', getDailyMood);
router.get('/history', getMoodHistory);
router.get('/average', getAverageMood);

module.exports = router;
