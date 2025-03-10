const express = require("express")
const router = express.Router()
const { auth, isAdmin } = require("../middlewares/auth")
const {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  adminDashboard,
  videoUpload,
  getAllUser,
  deleteUser,
  viewUser,
  singleUser,
} = require("../controlles/Profile")

router.delete("/deleteProfile", auth, deleteAccount)
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getAllUserDetails)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/adminDashboard", auth, isAdmin, adminDashboard)
router.post("/video-upload", videoUpload)
router.get("/getAllUser", getAllUser)
router.post("/delete-user", deleteUser)
router.get("/view-user/:_id", viewUser)
router.get("/single-user/:_id", singleUser)

module.exports = router