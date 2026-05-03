const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    totalTasks: {
      type: Number,
      required: true,
      default: 0,
    },
    completedTasks: {
      type: Number,
      required: true,
      default: 0,
    },
    studyHours: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Progress', progressSchema);
