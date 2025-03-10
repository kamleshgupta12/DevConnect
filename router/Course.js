// Import the required modules
const express = require("express")
const router = express.Router()

// Import the Controllers

// Course Controllers Import
const {
  createCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
  like,
  unlike,
  comment,
  posts,
  dislike,
} = require("../controlles/Course")




// Importing Middlewares
const { auth,  isUser, isAdmin } = require("../middlewares/auth")


// Courses can Only be Created by Instructors
router.post("/createCourse",  createCourse)
router.get("/post-feeds",  getAllCourses)
router.post("/like",  like)
router.post("/dislike",  dislike)
router.post("/comment",  comment)
router.get("/posts",  posts)

module.exports = router