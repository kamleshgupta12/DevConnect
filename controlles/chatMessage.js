const Message = require('../models/Message')

exports.chat = async (req, res) => {
    const { userId, otherUserId } = req.params;
    try {
        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        }).sort({ timestamp: 1 });

        res.json(
            {
                success:true,
                messages

            });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ message: "Server error" });
    }
};

