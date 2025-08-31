const Journal = require('../models/Journal');
const Mood = require('../models/Mood');
const moment = require('moment');

// @desc    Submit a new journal entry
// @route   POST /api/journals
// @access  Private
const createJournal = async (req, res, next) => {
  try {
    const { title, content, tags, isPrivate = true } = req.body;

    // Check if journal entry already exists for today
    const startOfDay = moment().startOf('day');
    const endOfDay = moment().endOf('day');
    
    const existingJournal = await Journal.findOne({
      user: req.user.id,
      date: {
        $gte: startOfDay.toDate(),
        $lte: endOfDay.toDate()
      }
    });

    if (existingJournal) {
      // Update existing journal entry
      existingJournal.title = title || existingJournal.title;
      existingJournal.content = content;
      existingJournal.tags = tags || existingJournal.tags;
      existingJournal.isPrivate = isPrivate;
      existingJournal.date = new Date();
      
      await existingJournal.save();

      return res.status(200).json({
        success: true,
        message: 'Journal entry updated successfully',
        data: existingJournal
      });
    }

    // Find today's mood entry to link
    const todaysMood = await Mood.findOne({
      user: req.user.id,
      date: {
        $gte: startOfDay.toDate(),
        $lte: endOfDay.toDate()
      }
    });

    // Create new journal entry
    const journal = await Journal.create({
      user: req.user.id,
      title,
      content,
      tags,
      isPrivate,
      mood: todaysMood ? todaysMood._id : null
    });

    res.status(201).json({
      success: true,
      message: 'Journal entry created successfully',
      data: journal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's journal entry
// @route   GET /api/journals/daily
// @access  Private
const getDailyJournal = async (req, res, next) => {
  try {
    const startOfDay = moment().startOf('day');
    const endOfDay = moment().endOf('day');

    const journal = await Journal.findOne({
      user: req.user.id,
      date: {
        $gte: startOfDay.toDate(),
        $lte: endOfDay.toDate()
      }
    }).populate('mood', 'moodType moodScore');

    res.status(200).json({
      success: true,
      data: journal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get journal history with optional date range filters
// @route   GET /api/journals/history
// @access  Private
const getJournalHistory = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 20, page = 1 } = req.query;

    let query = { user: req.user.id };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const journals = await Journal.find(query)
      .populate('mood', 'moodType moodScore')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    const total = await Journal.countDocuments(query);

    res.status(200).json({
      success: true,
      count: journals.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: journals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze sentiment of a specific journal entry
// @route   GET /api/journals/sentiment/:id
// @access  Private
const getJournalSentiment = async (req, res, next) => {
  try {
    const journal = await Journal.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!journal) {
      return res.status(404).json({
        success: false,
        message: 'Journal entry not found'
      });
    }

    // If sentiment already exists, return it
    if (journal.sentiment && journal.sentiment.score !== undefined) {
      return res.status(200).json({
        success: true,
        data: {
          sentiment: journal.sentiment,
          content: journal.content
        }
      });
    }

    // Basic sentiment analysis (placeholder - would integrate with external API)
    const sentiment = analyzeSentiment(journal.content);
    
    // Update journal with sentiment
    journal.sentiment = sentiment;
    await journal.save();

    res.status(200).json({
      success: true,
      data: {
        sentiment: journal.sentiment,
        content: journal.content
      }
    });
  } catch (error) {
    next(error);
  }
};

// Basic sentiment analysis function (placeholder)
const analyzeSentiment = (text) => {
  const positiveWords = ['happy', 'joy', 'love', 'excited', 'wonderful', 'amazing', 'great', 'good', 'fantastic', 'awesome'];
  const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful', 'bad', 'horrible', 'depressed', 'anxious', 'worried'];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) positiveCount++;
    if (negativeWords.includes(word)) negativeCount++;
  });
  
  const totalSentimentWords = positiveCount + negativeCount;
  let score = 0;
  let label = 'neutral';
  let confidence = 0.5;
  
  if (totalSentimentWords > 0) {
    score = (positiveCount - negativeCount) / totalSentimentWords;
    confidence = Math.min(totalSentimentWords / words.length * 2, 1);
    
    if (score > 0.1) label = 'positive';
    else if (score < -0.1) label = 'negative';
  }
  
  return {
    score: Math.max(-1, Math.min(1, score)),
    label,
    confidence: Math.round(confidence * 100) / 100
  };
};

module.exports = {
  createJournal,
  getDailyJournal,
  getJournalHistory,
  getJournalSentiment
};
