const express = require('express');
const router = express.Router();
const {
  createProgress,
  getProgress,
  updateProgress,
  deleteProgress,
} = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

// Protect all routes with JWT authentication
router.use(protect);

router.route('/')
  .post(createProgress)
  .get(getProgress);

router.route('/:id')
  .put(updateProgress)
  .delete(deleteProgress);

module.exports = router;
