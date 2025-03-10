const mongoose = require('mongoose');
const { type } = require('os');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    password: {
        type: String,
    },
    accountType: {
        type: String,
        enum: ["Admin", "User"],
    },
    githubId:{
        type:String, 
    },
    additionalDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile"
    },
    image:{
        type:String,
        required:true
    },
    token:{
        type:String,
    },
    resetPasswordExpires:{
        type:Date,
    },
    courseProgress:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"CourseProgress"
    }],
    createdAt: {
        type: Date,
        default: Date.now,
      },

})

module.exports  = mongoose.model("User", userSchema);