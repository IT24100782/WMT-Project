const express = require('express');
const router = express.Router();
const {
  createFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes with JWT authentication
router.use(protect);

router.route('/')
  .post(createFeedback)
  .get(getFeedback);

router.route('/:id')
  .put(updateFeedback)
  .delete(deleteFeedback);

module.exports = router;
