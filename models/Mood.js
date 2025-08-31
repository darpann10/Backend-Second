const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moodType: {
    type: String,
    required: [true, 'Please provide a mood type'],
    enum: ['very_sad', 'sad', 'neutral', 'happy', 'very_happy'],
  },
  moodScore: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  date: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    maxlength: [20, 'Tag cannot be more than 20 characters']
  }]
}, {
  timestamps: true
});

// Index for efficient queries
moodSchema.index({ user: 1, date: -1 });
moodSchema.index({ user: 1, createdAt: -1 });

// Static method to get mood score from type
moodSchema.statics.getMoodScore = function(moodType) {
  const moodScores = {
    'very_sad': 1,
    'sad': 2,
    'neutral': 3,
    'happy': 4,
    'very_happy': 5
  };
  return moodScores[moodType] || 3;
};

// Pre-save middleware to set mood score
moodSchema.pre('save', function(next) {
  if (this.isModified('moodType')) {
    this.moodScore = this.constructor.getMoodScore(this.moodType);
  }
  next();
});

module.exports = mongoose.model('Mood', moodSchema);
