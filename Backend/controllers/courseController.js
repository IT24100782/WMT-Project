
const Course = require('../models/Course');

// @desc    Create a course
// @route   POST /api/courses
// @access  Private
const createCourse = async (req, res) => {
  try {
    const { courseName, semester, userId } = req.body;
    
    // Fallback to logged-in user if userId is not explicitly provided
    const courseUserId = userId || (req.user ? req.user._id : null);
    
    if (!courseUserId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const course = await Course.create({
      courseName,
      semester,
      userId: courseUserId,
    });

    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all courses (for a user)
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    // If protected, restrict to the logged in user's courses
    const query = req.user ? { userId: req.user._id } : {};
    const courses = await Course.find(query);
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private
const updateCourse = async (req, res) => {
  try {
    const { courseName, semester } = req.body;
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check for user ownership if protected
    if (req.user && course.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    course = await Course.findByIdAndUpdate(
      req.params.id,
      { courseName, semester },
      { new: true }
    );

    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check for user ownership if protected
    if (req.user && course.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Course.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Course removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse,
};
