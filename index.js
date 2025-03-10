const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const mongoose = require("mongoose");
const Post = require("./models/Post");
const User = require("./models/User");
dotenv.config();
const PORT = process.env.PORT || 4000;
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.REACT_APP_BASE_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});
// Middleware
app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: process.env.REACT_APP_BASE_URL,
        credentials: true,
    })
);
// Database connection
database.DBConnection();

const userRoutes = require("./router/User");
const profileRouter = require("./router/Profile");
const courseRouter = require("./router/Course");
const socialLinkRouter = require("./router/SocialAppLink");
const quizRoutes = require("./router/quizRouter");
const alertRoutes = require("./router/Notification");

app.use("/api/auth", userRoutes);
app.use("/api/profile", profileRouter);
app.use("/api/course", courseRouter);
app.use("/api/social", socialLinkRouter);
app.use("/api/quiz", quizRoutes);
app.use("/api/alert", alertRoutes);

// Socket

const users = {};

io.on("connection", (socket) => {
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
                // Dislike
                post.likes = post.likes.filter((id) => id.toString() !== userId);
            } else {
                // Like
                post.likes.push(userId);
            }
            await post.save();

            const updatedPost = await Post.findById(postId)
                .populate("userId", "firstName lastName image socketId")
                .populate("comments.userId", "firstName lastName image");

            io.emit("postUpdated", updatedPost);

            // Notify post owner (only if different user)
            if (post.userId._id.toString() !== userId) {
                const ownerSocketId = users[post.userId._id.toString()];
                if (ownerSocketId) {
                    io.to(ownerSocketId).emit("notification", {
                        user: {
                            name: `${user.firstName} ${user.lastName}`,
                            image: user.image,
                        },
                        message: isLiked ? "dislike your post" : "liked your post",
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

            // Notify post owner (only if a different user)
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
});

server.listen(PORT, () => {
    console.log(`App is running at ${PORT}`);
});
