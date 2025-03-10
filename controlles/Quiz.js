const Quiz = require("../models/Quiz");

// Save a new quiz
exports.createQuiz = async (req, res) => {
  try {
    const { quizTitle, questions, userId } = req.body;
    console.log(userId,"test")
    const newQuiz = new Quiz({ quizTitle, questions, userId });
    await newQuiz.save();
    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(500).json({ error: "Failed to create quiz" });
  }
};

// Fetch all quizzes
exports.getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch quizzes" });
  }
};
