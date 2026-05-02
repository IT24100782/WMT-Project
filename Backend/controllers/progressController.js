const Progress = require('../models/Progress');

// @desc    Create a progress tracker
// @route   POST /progress
// @access  Private
const createProgress = async (req, res) => {
  try {
    const { totalTasks, completedTasks, studyHours } = req.body;

    const progress = await Progress.create({
      totalTasks: totalTasks || 0,
      completedTasks: completedTasks || 0,
      studyHours: studyHours || 0,
      userId: req.user._id, // Assign logged-in user id
    });

    res.status(201).json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged in user progress
// @route   GET /progress
// @access  Private
const getProgress = async (req, res) => {
  try {
    const progressRecords = await Progress.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(progressRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update progress
// @route   PUT /progress/:id
// @access  Private
const updateProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalTasks, completedTasks, studyHours } = req.body;

    let progress = await Progress.findById(id);

    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }

    // Check for user
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged-in user matches the progress user
    if (progress.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this progress record' });
    }

    const updatedProgress = await Progress.findByIdAndUpdate(
      id,
      { totalTasks, completedTasks, studyHours },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete progress
// @route   DELETE /progress/:id
// @access  Private
const deleteProgress = async (req, res) => {
  try {
    const { id } = req.params;

    const progress = await Progress.findById(id);

    if (!progress) {
      return res.status(404).json({ message: 'Progress record not found' });
    }

    // Check for user
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged-in user matches the progress user
    if (progress.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this progress record' });
    }

    await progress.deleteOne();

    res.status(200).json({ id: req.params.id, message: 'Progress deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createProgress,
  getProgress,
  updateProgress,
  deleteProgress,
};
