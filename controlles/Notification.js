const Notification = require("../models/Notification.js")


// Save notification to DB

exports.saveNotification = async (req, res) => {
    try {
        const { message, user } = req.body; 
        const { userId } = req.params; 

        if (!user || !user.image || !user.name) {
            return res.status(400).json({
                success: false,
                message: "User image and name are required."
            });
        }

        const notification = new Notification({
            userId,
            message,
            user: {
                image: user.image,
                name: user.name
            }
        });

        await notification.save();

        res.status(201).json({
            success: true,
            notification
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};


// Get notifications for a user
exports.getNotification = async (req, res) => {
    try {
        const { userId } = req.params;

        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,  
            notifications
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Mark all notifications as read
exports.updateNotification = async (req, res) => {
    try {
        const { userId } = req.params;

        await Notification.updateMany({ userId }, { read: true });

        res.status(200).json({
            success: true,
            message: "Notifications marked as read."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// Clear all notifications
exports.deleteNotification = async (req, res) => {
    try {
        const { userId } = req.params;

        await Notification.deleteMany({ userId });

        res.status(200).json({
            success: true,
            message: "All notifications deleted."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

