const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
    senderId: {
        type: String,
    },
    receiverId: {
        type: String,
    },
    message: {
        type: String,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});
const Message = mongoose.model("Message", MessageSchema);
module.exports = Message