const User = require("../models/User");
const Profile = require("../models/Profile");

// Get User Social Links
exports.getSocialLink = async (req, res) => {
    const {userId} = req.params
  try {
    const user = await User.findById(userId).populate("additionalDetails");
    if (!user || !user.additionalDetails) {
      return res.status(404).json({ message: "User or profile not found" });
    }

    res.json({ socialLinks: user.additionalDetails.socialLinks || {} });
  } catch (error) {
    console.error("Error fetching social links:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updateSocialLink = async (req, res) => {
  try {
    const { socialLinks } = req.body;
    const {userId} = req.params
    if(!socialLinks.length>0){
        return res.status(402).json({
            success:false,
            message:"Social links not found."
        })
    }

    const user = await User.findById(userId).populate("additionalDetails");
    if (!user || !user.additionalDetails) {
      return res.status(404).json({ message: "User or profile not found" });
    }

    await Profile.findByIdAndUpdate(user.additionalDetails._id, { socialLinks }, { new: true });

    res.json({ message: "Social links updated successfully", socialLinks });
  } catch (error) {
    console.error("Error updating social links:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
