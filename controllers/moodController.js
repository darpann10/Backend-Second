const Mood = require('../models/Mood');
const moment = require('moment');

// @desc    Submit a new mood entry
// @route   POST /api/moods
// @access  Private
const createMood = async (req, res, next) => {
  try {
    const { moodType, notes, tags } = req.body;

    // Check if mood entry already exists for today
    const startOfDay = moment().startOf('day');
    const endOfDay = moment().endOf('day');
    
    const existingMood = await Mood.findOne({
      user: req.user.id,
      date: {
        $gte: startOfDay.toDate(),
        $lte: endOfDay.toDate()
      }
    });

    if (existingMood) {
      // Update existing mood entry
      existingMood.moodType = moodType;
      existingMood.notes = notes;
      existingMood.tags = tags;
      existingMood.date = new Date();
      
      await existingMood.save();

      return res.status(200).json({
        success: true,
        message: 'Mood entry updated successfully',
        data: existingMood
      });
    }

    // Create new mood entry
    const mood = await Mood.create({
      user: req.user.id,
      moodType,
      notes,
      tags
    });

    res.status(201).json({
      success: true,
      message: 'Mood entry created successfully',
      data: mood
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get today's mood entry
// @route   GET /api/moods/daily
// @access  Private
const getDailyMood = async (req, res, next) => {
  try {
    const startOfDay = moment().startOf('day');
    const endOfDay = moment().endOf('day');

    const mood = await Mood.findOne({
      user: req.user.id,
      date: {
        $gte: startOfDay.toDate(),
        $lte: endOfDay.toDate()
      }
    });

    res.status(200).json({
      success: true,
      data: mood
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get mood history with optional date range filters
// @route   GET /api/moods/history
// @access  Private
const getMoodHistory = async (req, res, next) => {
  try {
    const { startDate, endDate, limit = 30, page = 1 } = req.query;

    let query = { user: req.user.id };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const moods = await Mood.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Mood.countDocuments(query);

    res.status(200).json({
      success: true,
      count: moods.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: moods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate average mood score over specified period
// @route   GET /api/moods/average
// @access  Private
const getAverageMood = async (req, res, next) => {
  try {
    const { period = '7d', startDate, endDate } = req.query;

    let query = { user: req.user.id };

    // Set date range based on period or custom dates
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else {
      const periodMap = {
        '7d': 7,
        '30d': 30,
        '90d': 90,
        '1y': 365
      };
      
      const days = periodMap[period] || 7;
      query.date = {
        $gte: moment().subtract(days, 'days').startOf('day').toDate(),
        $lte: moment().endOf('day').toDate()
      };
    }

    const result = await Mood.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$moodScore' },
          totalEntries: { $sum: 1 },
          moodDistribution: {
            $push: '$moodType'
          }
        }
      }
    ]);

    if (result.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          averageScore: 0,
          totalEntries: 0,
          moodDistribution: {}
        }
      });
    }

    // Calculate mood distribution
    const moodCounts = result[0].moodDistribution.reduce((acc, mood) => {
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    res.status(200).json({
      success: true,
      data: {
        averageScore: Math.round(result[0].averageScore * 100) / 100,
        totalEntries: result[0].totalEntries,
        moodDistribution: moodCounts
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createMood,
  getDailyMood,
  getMoodHistory,
  getAverageMood
};
