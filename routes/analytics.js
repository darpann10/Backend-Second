const express = require('express');
const {
  getTrends,
  getStreaks,
  getInsights
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All routes are protected

router.get('/trends', getTrends);
router.get('/streaks', getStreaks);
router.get('/insights', getInsights);

module.exports = router;
