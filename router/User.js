const express = require("express")
const router = express.Router()

const {
  login,
  signup,
  changePassword,
  sendotp,
  googleAuth,
  githubAuth,
  getGithubUser,
  detect,
} = require("../controlles/Auth")

const { auth } = require("../middlewares/auth")
const { resetPasswordToken, resetPassword } = require("../controlles/ResetPassword")


router.post("/login", login)
router.post("/signup", signup)
router.post("/sendotp", sendotp)
router.post("/changepassword", auth, changePassword)
router.post("/google", googleAuth)
router.get('/getAccessToken', githubAuth);
router.get('/getUserData', getGithubUser);
router.post("/reset-password-token", resetPasswordToken)
router.post("/reset-password", resetPassword)
router.post("/user-data", detect)

module.exports = router