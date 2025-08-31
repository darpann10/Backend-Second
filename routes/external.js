const express = require('express');
const {
  analyzeSentiment,
  getQuotesByMood
} = require('../controllers/externalController');
const { protect } = require('../middleware/auth');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.use(protect); // All routes are protected

// Validation for sentiment analysis
const validateSentimentAnalysis = [
  body('text')
    .notEmpty()
    .withMessage('Text is required')
    .isLength({ max: 5000 })
    .withMessage('Text cannot be more than 5000 characters'),
  handleValidationErrors
];

router.post('/sentiment/analyze', validateSentimentAnalysis, analyzeSentiment);
router.get('/quotes/mood', getQuotesByMood);

module.exports = router;
