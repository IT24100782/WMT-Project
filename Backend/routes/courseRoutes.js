const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');
const { protect } = require('../middleware/authMiddleware');

// Using the protect middleware for all course routes to ensure user is authenticated
router.route('/').post(protect, createCourse).get(protect, getCourses);
router.route('/:id').put(protect, updateCourse).delete(protect, deleteCourse);

module.exports = router;
