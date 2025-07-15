const Message = require("../models/Message");

const activeUsers = {};

module.exports = (io, socket) => {
    console.log("New client connected:", socket.id);

    socket.on("registerUser", (userId) => {
        activeUsers[userId] = socket.id;
        console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("leaveRoom", (roomId) => {
        socket.leave(roomId);
        console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
        try {
            if (!senderId || !receiverId || !message) {
                console.error("Missing required fields");
                return;
            }

            const newMessage = new Message({
                senderId,
                receiverId,
                message,
                timestamp: new Date()
            });
            await newMessage.save();

            const roomId = [senderId, receiverId].sort().join("-");

            io.to(roomId).emit("receiveMessage", newMessage);

        } catch (error) {
            console.error("Error handling message:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        Object.keys(activeUsers).forEach(userId => {
            if (activeUsers[userId] === socket.id) {
                delete activeUsers[userId];
            }
        });
    });
};