const express = require('express');
const router = express.Router();
const {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createResource)
  .get(protect, getResources);

router.route('/:id')
  .get(protect, getResourceById)
  .put(protect, updateResource)
  .delete(protect, deleteResource);

module.exports = router;
