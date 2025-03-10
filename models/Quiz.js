const mongoose = require("mongoose");

const QuizSchema = new mongoose.Schema({
    quizTitle: { type: String, required: true },
    questions: [    
        {
            question: {
                type: String,
                required: true
            },
            answers: {
                type: [String],
                required: true
            },
           
            correctAnswer: {
                type: String,
                required: true
            },
        },
    ],
    userId:{
        type:String,

    },
});

module.exports = mongoose.model("Quiz", QuizSchema);
