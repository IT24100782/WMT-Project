const Note = require('../models/Note');

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
const createNote = async (req, res) => {
  try {
    const { title, description, courseId, userId } = req.body;

    const noteUserId = userId || (req.user ? req.user._id : null);

    if (!noteUserId) {
      return res.status(400).json({ message: 'UserId is required' });
    }

    const note = await Note.create({
      title,
      description,
      courseId,
      userId: noteUserId,
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all notes (for a user)
// @route   GET /api/notes
// @access  Private
const getNotes = async (req, res) => {
  try {
    const query = req.user ? { userId: req.user._id } : {};
    
    // Optional: filter by courseId if parsing query params like /api/notes?courseId=123
    if (req.query.courseId) {
      query.courseId = req.query.courseId;
    }

    const notes = await Note.find(query);
    res.status(200).json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a note
// @route   PUT /api/notes/:id
// @access  Private
const updateNote = async (req, res) => {
  try {
    const { title, description, courseId } = req.body;
    let note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (req.user && note.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    note = await Note.findByIdAndUpdate(
      req.params.id,
      { title, description, courseId },
      { new: true }
    );

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a note
// @route   DELETE /api/notes/:id
// @access  Private
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (req.user && note.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Note.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Note removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
};
