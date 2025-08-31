const express = require('express');
const {
  createJournal,
  getDailyJournal,
  getJournalHistory,
  getJournalSentiment
} = require('../controllers/journalController');
const { protect } = require('../middleware/auth');
const { validateJournal } = require('../middleware/validation');

const router = express.Router();

router.use(protect); // All routes are protected

router.post('/', validateJournal, createJournal);
router.get('/daily', getDailyJournal);
router.get('/history', getJournalHistory);
router.get('/sentiment/:id', getJournalSentiment);

module.exports = router;
