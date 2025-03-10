const { Server } = require("socket.io");

let onlineUsers = new Map();

function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:3000",
        },
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("addUser", (userId) => {
            onlineUsers.set(userId, socket.id);
        });

        socket.on("likePost", ({ postOwnerId, likerName }) => {
            const receiverSocketId = onlineUsers.get(postOwnerId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newNotification", {
                    message: `${likerName} liked your post!`,
                });
            }
        });

        socket.on("disconnect", () => {
            onlineUsers.forEach((value, key) => {
                if (value === socket.id) {
                    onlineUsers.delete(key);
                }
            });
            console.log("User disconnected:", socket.id);
        });
    });
}

module.exports = { setupSocket };

