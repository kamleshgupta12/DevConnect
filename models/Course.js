const mongoose = require('mongoose');
const { type } = require('os');

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
    },
    courseDescription: {
        type: String,

    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    whatYouWillLearn: {
        type: String,

    },
    courseContent: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
    }],
    ratingAndReviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ratingAndReview",
    }],
    price: {
        type: Number
    },
    thambnail: {
        stype: String
    },
    tag: {
        type: [String],
        required:true
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },
    usersEnrolled: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }],
admin:{
    type:[String]
},
status:{
    type:String,
    enum:["Draft", "Published"],
}   

})

module.exports = mongoose.model("Course", courseSchema);