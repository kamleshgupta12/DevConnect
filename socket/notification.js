const socketIO = (io) => {
    io.on("connection", (socket) => {
      console.log("User Connected:", socket.id);
  
      socket.on("likePost", (data) => {
        io.emit("newLike", data);
      });
  
      socket.on("commentPost", (data) => {
        io.emit("newComment", data);
      });
  
      socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
      });
    });
  };
  
  module.exports = socketIO;
  