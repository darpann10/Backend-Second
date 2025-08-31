const express = require('express');
const {
  signup,
  login,
  getMe,
  updateDetails
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateSignup, validateLogin } = require('../middleware/validation');

const router = express.Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/update', protect, updateDetails);

module.exports = router;
