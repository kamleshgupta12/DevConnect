const Post = require("../models/Post");
const User = require("../models/User");

const users = {};

module.exports = (io, socket) => {
    console.log("New client connected:", socket.id);

    socket.on("registerUser", (userId) => {
        users[userId] = socket.id;
    });

    socket.on("likePost", async ({ postId, userId }) => {
        try {
            const post = await Post.findById(postId).populate("userId", "socketId");
            const user = await User.findById(userId, "firstName lastName image");

            if (!post || !user) return;

            let isLiked = post.likes.includes(userId);

            if (isLiked) {
                post.likes = post.likes.filter((id) => id.toString() !== userId);
            } else {
                post.likes.push(userId);
            }
            await post.save();

            const updatedPost = await Post.findById(postId)
                .populate("userId", "firstName lastName image socketId")
                .populate("comments.userId", "firstName lastName image");

            io.emit("postUpdated", updatedPost);

            if (post.userId._id.toString() !== userId) {
                const ownerSocketId = users[post.userId._id.toString()];
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit("notification", {
                        user: {
                            name: `${user.firstName} ${user.lastName}`,
                            image: user.image,
                        },
                        message: isLiked ? "disliked your post" : "liked your post",
                        type: isLiked ? "dislike" : "like",
                        postId,
                    });
                }
            }
        } catch (error) {
            console.error("Error handling like/dislike:", error);
        }
    });

    socket.on("commentPost", async ({ postId, userId, text }) => {
        try {
            const post = await Post.findById(postId);
            const user = await User.findById(userId, "firstName lastName image");

            if (!post || !user) return;

            post.comments.push({ userId, text });
            await post.save();

            const updatedPost = await Post.findById(postId)
                .populate("userId", "firstName lastName image")
                .populate("comments.userId", "firstName lastName image");

            io.emit("postUpdated", updatedPost);

            if (post.userId._id.toString() !== userId) {
                const ownerSocketId = users[post.userId._id.toString()];
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit("notification", {
                        user: {
                            name: `${user.firstName} ${user.lastName}`,
                            image: user.image,
                        },
                        message: `commented: "${text}" on your post.`,
                        type: "comment",
                        postId,
                    });
                }
            }
        } catch (error) {
            console.error("Error adding comment:", error);
        }
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
        Object.keys(users).forEach((userId) => {
            if (users[userId] === socket.id) {
                delete users[userId];
            }
        });
    });
};
