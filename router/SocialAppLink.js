const express = require("express")
const router = express.Router()
const { updateSocialLink, getSocialLink } = require("../controlles/SocialAppLink")


router.put("/update-link/:userId", updateSocialLink)
router.get("/get-link/:userId", getSocialLink)

module.exports = router