const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Set daily reminder time
// @route   POST /api/notifications/reminder
// @access  Private
const setReminder = async (req, res, next) => {
  try {
    const { time } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { reminderTime: time },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Daily reminder set successfully',
      data: {
        reminderTime: user.reminderTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current daily reminder time
// @route   GET /api/notifications/reminder
// @access  Private
const getReminder = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        reminderTime: user.reminderTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove daily reminder
// @route   DELETE /api/notifications/reminder
// @access  Private
const removeReminder = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { reminderTime: null },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Daily reminder removed successfully',
      data: {
        reminderTime: user.reminderTime
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const { limit = 20, page = 1, unreadOnly = false } = req.query;

    let query = { user: req.user.id };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Notification.countDocuments(query);

    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      data: notifications
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  setReminder,
  getReminder,
  removeReminder,
  getNotifications,
  markAsRead
};
