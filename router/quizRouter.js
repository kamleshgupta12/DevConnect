const express = require("express");
const { createQuiz, getQuizzes } = require("../controlles/Quiz");
const router = express.Router();

router.post("/create-quiz", createQuiz);
router.get("/get-quiz", getQuizzes);

module.exports = router;
