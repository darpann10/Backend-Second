const Mood = require('../models/Mood');
const Journal = require('../models/Journal');
const moment = require('moment');

// @desc    Generate mood trend graphs
// @route   GET /api/analytics/trends
// @access  Private
const getTrends = async (req, res, next) => {
  try {
    const { period = 'weekly' } = req.query;
    
    let groupBy, dateRange, format;
    
    switch (period) {
      case 'daily':
        groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
        dateRange = moment().subtract(30, 'days').startOf('day').toDate();
        format = 'YYYY-MM-DD';
        break;
      case 'weekly':
        groupBy = { $dateToString: { format: "%Y-W%U", date: "$date" } };
        dateRange = moment().subtract(12, 'weeks').startOf('week').toDate();
        format = 'YYYY-[W]WW';
        break;
      case 'monthly':
        groupBy = { $dateToString: { format: "%Y-%m", date: "$date" } };
        dateRange = moment().subtract(12, 'months').startOf('month').toDate();
        format = 'YYYY-MM';
        break;
      default:
        groupBy = { $dateToString: { format: "%Y-W%U", date: "$date" } };
        dateRange = moment().subtract(12, 'weeks').startOf('week').toDate();
        format = 'YYYY-[W]WW';
    }

    const trends = await Mood.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: dateRange }
        }
      },
      {
        $group: {
          _id: groupBy,
          averageScore: { $avg: '$moodScore' },
          count: { $sum: 1 },
          moods: { $push: '$moodType' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        period,
        trends: trends.map(trend => ({
          period: trend._id,
          averageScore: Math.round(trend.averageScore * 100) / 100,
          entryCount: trend.count,
          moodDistribution: trend.moods.reduce((acc, mood) => {
            acc[mood] = (acc[mood] || 0) + 1;
            return acc;
          }, {})
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate streaks of consecutive mood entries
// @route   GET /api/analytics/streaks
// @access  Private
const getStreaks = async (req, res, next) => {
  try {
    const moods = await Mood.find({ user: req.user.id })
      .sort({ date: -1 })
      .select('date moodScore');

    let currentStreak = 0;
    let longestStreak = 0;
    let currentPositiveStreak = 0;
    let longestPositiveStreak = 0;
    
    const today = moment().startOf('day');
    let lastDate = null;

    for (let i = 0; i < moods.length; i++) {
      const moodDate = moment(moods[i].date).startOf('day');
      
      if (i === 0) {
        // Check if today has an entry
        if (moodDate.isSame(today)) {
          currentStreak = 1;
          if (moods[i].moodScore >= 4) currentPositiveStreak = 1;
        }
      } else {
        const expectedDate = moment(lastDate).subtract(1, 'day');
        
        if (moodDate.isSame(expectedDate)) {
          currentStreak++;
          if (moods[i].moodScore >= 4) {
            currentPositiveStreak++;
          } else {
            longestPositiveStreak = Math.max(longestPositiveStreak, currentPositiveStreak);
            currentPositiveStreak = 0;
          }
        } else {
          longestStreak = Math.max(longestStreak, currentStreak);
          longestPositiveStreak = Math.max(longestPositiveStreak, currentPositiveStreak);
          currentStreak = 1;
          currentPositiveStreak = moods[i].moodScore >= 4 ? 1 : 0;
        }
      }
      
      lastDate = moodDate;
    }

    longestStreak = Math.max(longestStreak, currentStreak);
    longestPositiveStreak = Math.max(longestPositiveStreak, currentPositiveStreak);

    res.status(200).json({
      success: true,
      data: {
        currentStreak,
        longestStreak,
        currentPositiveStreak,
        longestPositiveStreak,
        totalEntries: moods.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Provide insights based on mood patterns and journal sentiments
// @route   GET /api/analytics/insights
// @access  Private
const getInsights = async (req, res, next) => {
  try {
    const { period = '30d' } = req.query;
    
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const startDate = moment().subtract(days, 'days').startOf('day').toDate();

    // Get mood data
    const moods = await Mood.find({
      user: req.user.id,
      date: { $gte: startDate }
    }).sort({ date: 1 });

    // Get journal data with sentiment
    const journals = await Journal.find({
      user: req.user.id,
      date: { $gte: startDate },
      'sentiment.score': { $exists: true }
    }).sort({ date: 1 });

    const insights = [];

    // Mood pattern insights
    if (moods.length > 0) {
      const avgMood = moods.reduce((sum, mood) => sum + mood.moodScore, 0) / moods.length;
      const moodTrend = calculateTrend(moods.map(m => m.moodScore));
      
      if (avgMood >= 4) {
        insights.push({
          type: 'positive',
          title: 'Great Mood Trend!',
          message: `Your average mood over the last ${days} days has been ${avgMood.toFixed(1)}/5. Keep up the positive energy!`
        });
      } else if (avgMood <= 2) {
        insights.push({
          type: 'concern',
          title: 'Mood Support',
          message: `Your mood has been lower recently. Consider reaching out to friends or engaging in activities you enjoy.`
        });
      }

      if (moodTrend > 0.1) {
        insights.push({
          type: 'improvement',
          title: 'Mood Improving',
          message: 'Your mood has been trending upward recently. Great progress!'
        });
      }
    }

    // Journal sentiment insights
    if (journals.length > 0) {
      const avgSentiment = journals.reduce((sum, j) => sum + j.sentiment.score, 0) / journals.length;
      
      if (avgSentiment > 0.3) {
        insights.push({
          type: 'positive',
          title: 'Positive Journaling',
          message: 'Your journal entries have been quite positive lately. Writing seems to be helping your mindset!'
        });
      }
    }

    // Consistency insights
    const consistencyRate = moods.length / days;
    if (consistencyRate >= 0.8) {
      insights.push({
        type: 'achievement',
        title: 'Consistent Tracking',
        message: `You've been very consistent with mood tracking - ${Math.round(consistencyRate * 100)}% of days logged!`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        period: `${days} days`,
        insights,
        stats: {
          moodEntries: moods.length,
          journalEntries: journals.length,
          averageMood: moods.length > 0 ? Math.round(moods.reduce((sum, m) => sum + m.moodScore, 0) / moods.length * 100) / 100 : 0,
          averageSentiment: journals.length > 0 ? Math.round(journals.reduce((sum, j) => sum + j.sentiment.score, 0) / journals.length * 100) / 100 : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate trend
const calculateTrend = (values) => {
  if (values.length < 2) return 0;
  
  const n = values.length;
  const sumX = values.reduce((sum, _, i) => sum + i, 0);
  const sumY = values.reduce((sum, val) => sum + val, 0);
  const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
  const sumXX = values.reduce((sum, _, i) => sum + (i * i), 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  return slope;
};

module.exports = {
  getTrends,
  getStreaks,
  getInsights
};
