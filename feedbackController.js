const Feedback = require('../models/Feedback');

// @desc    Create feedback
// @route   POST /feedback
// @access  Private
const createFeedback = async (req, res) => {
  try {
    const { rating, comment, noteId } = req.body;

    if (!rating || !noteId) {
      return res.status(400).json({ message: 'Please provide rating and noteId' });
    }

    const feedback = await Feedback.create({
      rating,
      comment: comment || '', // Optional comment
      noteId,
      userId: req.user._id, // Assign logged-in user id
    });

    res.status(201).json(feedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get logged in user feedback
// @route   GET /feedback
// @access  Private
const getFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedback.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(feedbackList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update feedback
// @route   PUT /feedback/:id
// @access  Private
const updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, noteId } = req.body;

    let feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check for user
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged-in user matches the feedback user
    if (feedback.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this feedback' });
    }

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { rating, comment, noteId },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedFeedback);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete feedback
// @route   DELETE /feedback/:id
// @access  Private
const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check for user
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Make sure the logged-in user matches the feedback user
    if (feedback.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this feedback' });
    }

    await feedback.deleteOne();

    res.status(200).json({ id: req.params.id, message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createFeedback,
  getFeedback,
  updateFeedback,
  deleteFeedback,
};
