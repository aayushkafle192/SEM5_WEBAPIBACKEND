const Notification = require('../models/NotificationModel');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ data: notifications }); 
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ message: 'Server error while fetching notifications.' });
  }
};

exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOne({ _id: req.params.id, userId: req.user._id });
        if (notification) {
            notification.isRead = true;
            await notification.save();
            res.json({ message: 'Notification marked as read' });
        } else {
            res.status(404).json({ message: 'Notification not found or user not authorized.' });
        }
    } catch (error) {
        console.error("Error marking notification as read:", error);
        res.status(500).json({ message: 'Server error.' });
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ message: 'All notifications successfully marked as read.' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Server error.' });
    }
};