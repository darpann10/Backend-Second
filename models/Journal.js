const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Please provide journal content'],
    maxlength: [5000, 'Content cannot be more than 5000 characters']
  },
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1
    },
    label: {
      type: String,
      enum: ['positive', 'negative', 'neutral']
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  mood: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mood'
  },
  tags: [{
    type: String,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }],
  isPrivate: {
    type: Boolean,
    default: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
journalSchema.index({ user: 1, date: -1 });
journalSchema.index({ user: 1, createdAt: -1 });
journalSchema.index({ user: 1, 'sentiment.label': 1 });

module.exports = mongoose.model('Journal', journalSchema);
