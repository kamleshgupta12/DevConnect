const postSocket = require("./postSocket");
const userSocket = require("./userSocket");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("New client connected:", socket.id);

        postSocket(io, socket);
        userSocket(io, socket);

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
};
