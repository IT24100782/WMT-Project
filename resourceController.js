const Resource = require('../models/Resource');

// @desc    Create a resource
// @route   POST /api/resources
// @access  Private
const createResource = async (req, res) => {
  try {
    const { courseId, title, link, description } = req.body;
    
    console.log('Creating resource for user:', req.user._id);

    const resource = await Resource.create({
      userId: req.user._id,
      courseId,
      title,
      link,
      description,
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error('Error in createResource:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all resources for logged-in user
// @route   GET /api/resources
// @access  Private
const getResources = async (req, res) => {
  try {
    console.log('Fetching resources for user:', req.user._id);
    const resources = await Resource.find({ userId: req.user._id });
    res.status(200).json(resources);
  } catch (error) {
    console.error('Error in getResources:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get one resource
// @route   GET /api/resources/:id
// @access  Private
const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      console.log('Resource not found:', req.params.id);
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check for user ownership
    if (resource.userId.toString() !== req.user._id.toString()) {
      console.log('User not authorized to access resource:', req.params.id);
      return res.status(401).json({ message: 'User not authorized' });
    }

    res.status(200).json(resource);
  } catch (error) {
    console.error('Error in getResourceById:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a resource
// @route   PUT /api/resources/:id
// @access  Private
const updateResource = async (req, res) => {
  try {
    const { courseId, title, link, description } = req.body;
    let resource = await Resource.findById(req.params.id);

    if (!resource) {
      console.log('Resource not found for update:', req.params.id);
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check for user ownership
    if (resource.userId.toString() !== req.user._id.toString()) {
      console.log('User not authorized to update resource:', req.params.id);
      return res.status(401).json({ message: 'User not authorized' });
    }

    resource = await Resource.findByIdAndUpdate(
      req.params.id,
      { courseId, title, link, description },
      { new: true }
    );

    console.log('Resource updated:', req.params.id);
    res.status(200).json(resource);
  } catch (error) {
    console.error('Error in updateResource:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private
const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      console.log('Resource not found for deletion:', req.params.id);
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Check for user ownership
    if (resource.userId.toString() !== req.user._id.toString()) {
      console.log('User not authorized to delete resource:', req.params.id);
      return res.status(401).json({ message: 'User not authorized' });
    }

    await Resource.findByIdAndDelete(req.params.id);
    console.log('Resource deleted:', req.params.id);
    res.status(200).json({ message: 'Resource removed' });
  } catch (error) {
    console.error('Error in deleteResource:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createResource,
  getResources,
  getResourceById,
  updateResource,
  deleteResource,
};
