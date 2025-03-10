const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  tags:[{
    type:String
  }],
  category:{
    type:String
  },
  code: {
    type: String,
  },
  content: {
    type: String,
  },

  videoUrl: {
    type: String,
  },
  thumbnail:{
    type:String
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: "User",  
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,  
    ref: "User",  
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,  
      ref: "User", 
    },
    text: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
