const Message = require("../models/Message");

const users = {}; 

module.exports = (io, socket) => {
    console.log("New client connected:", socket.id);

    socket.on("registerUser", (userId) => {
        users[userId] = socket.id;
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
        try {
            console.log(`Received message from ${senderId} to ${receiverId}:`, message);
            
            // Validate data
            if (!senderId || !receiverId || !message) {
                console.error("Missing required fields in sendMessage event:", { senderId, receiverId, message });
                return;
            }
    
            // Save message to DB
            const newMessage = new Message({ senderId, receiverId, message, timestamp: new Date() });
            await newMessage.save();
    
            // Check if receiver is online
            const receiverSocketId = users[receiverId];
            console.log(`Receiver Socket ID: ${receiverSocketId}`);
    
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receiveMessage", newMessage);
                console.log("Message sent to receiver.");
            } else {
                console.warn("Receiver is offline or not registered.");
            }
        } catch (error) {
            console.error("Error saving message:", error);
        }
    });
    
    socket.on("fetchMessages", async ({ userId, selectedUserId }) => {
        try {
            const messages = await Message.find({
                $or: [
                    { senderId: userId, receiverId: selectedUserId },
                    { senderId: selectedUserId, receiverId: userId },
                ],
            }).sort({ timestamp: 1 });
    
            socket.emit("chatHistory", messages);
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    });
    

    // Handle user disconnect
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        Object.keys(users).forEach((userId) => {
            if (users[userId] === socket.id) {
                delete users[userId];
            }
        });
    });
};
