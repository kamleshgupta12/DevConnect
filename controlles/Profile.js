const Profile = require("../models/Profile");
const User = require("../models/User");
const Course = require("../models/Course");
const { uploadImageToCloudinary } = require("../utils/imageUploder");
require('dotenv').config();
const cloudinary = require("cloudinary").v2;
const Post = require('../models/Post')

exports.updateProfile = async (req, res) => {
	try {
		const { dateOfBirth = "", about = "", contactNumber = "", firstName, lastName, gender = "" } = req.body;
		const id = req.user.id;

		// Find the profile by id
		const userDetails = await User.findById(id);
		const profile = await Profile.findById(userDetails.additionalDetails);

		// Update the profile fields
		userDetails.firstName = firstName || userDetails.firstName;
		userDetails.lastName = lastName || userDetails.lastName;
		profile.dateOfBirth = dateOfBirth || profile.dateOfBirth;
		profile.about = about || profile.about;
		profile.gender = gender || profile.gender;
		profile.contactNumber = contactNumber || profile.contactNumber;

		// Save the updated profile
		await profile.save();
		await userDetails.save();

		return res.json({
			success: true,
			message: "Profile updated successfully",
			profile,
			userDetails
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			success: false,
			error: error.message,
		});
	}
};

exports.deleteAccount = async (req, res) => {
	try {
		const id = req.user.id;
		const user = await User.findById({ _id: id });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}
		// Delete Assosiated Profile with the User
		await Profile.findByIdAndDelete({ _id: user.additionalDetails });
		await User.findByIdAndDelete({ _id: id });
		res.status(200).json({
			success: true,
			message: "User deleted successfully",
		});
	} catch (error) {
		console.log(error);
		res
			.status(500)
			.json({ success: false, message: "User Cannot be deleted successfully", error: error.message });
	}
};

exports.getAllUserDetails = async (req, res) => {
	try {
		const id = req.user.id;
		const userDetails = await User.findById(id)
			.populate("additionalDetails")
			.exec();
		console.log(userDetails);
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: userDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};

//updateDisplayPicture


exports.updateDisplayPicture = async (req, res) => {
    try {
        const displayPicture = req.files.displayPicture
        console.log(`display picture  ; -> ${displayPicture}`);
        const userId = req.user.id
        console.log(`userId : - > ${userId}`);
        const image = await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )
		
		console.log("Foldernmae:----",displayPicture)
        console.log("image URL are : - >", image?.secure_url)
        const updatedProfile = await User.findByIdAndUpdate(
            { _id: userId },
            { image: image.secure_url},
            { new: true }
        )
        res.status(200).json({
            success: true,
            message: `Image Updated successfully`,
            data: updatedProfile,
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "issue with updating the profile picture",
            error: err.message,
        })
    }
};

//instructor dashboard
exports.adminDashboard = async (req, res) => {
	try {
		const id = req.user.id;
		const courseData = await Course.find({ instructor: id });
		const courseDetails = courseData.map((course) => {
			totalStudents = course?.studentsEnrolled?.length;
			totalRevenue = course?.price * totalStudents;
			const courseStats = {
				_id: course._id,
				courseName: course.courseName,
				courseDescription: course.courseDescription,
				totalStudents,
				totalRevenue,
			};
			return courseStats;
		});
		res.status(200).json({
			success: true,
			message: "User Data fetched successfully",
			data: courseDetails,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}

exports.updateProfile = async (req, res) => {
	try {
	  const {
		firstName = "",
		lastName = "",
		dateOfBirth = "",
		about = "",
		contactNumber = "",
		gender = "",
	  } = req.body
	  const id = req.user.id
  
	  // Find the profile by id
	  const userDetails = await User.findById(id)
	  const profile = await Profile.findById(userDetails.additionalDetails)
  
	  const user = await User.findByIdAndUpdate(id, {
		firstName,
		lastName,
	  })
	  await user.save()
  
	  // Update the profile fields
	  profile.dateOfBirth = dateOfBirth
	  profile.about = about
	  profile.contactNumber = contactNumber
	  profile.gender = gender
  
	  // Save the updated profile
	  await profile.save()
  
	  // Find the updated user details
	  const updatedUserDetails = await User.findById(id)
		.populate("additionalDetails")
		.exec()
  
	  return res.json({
		success: true,
		message: "Profile updated successfully",
		updatedUserDetails,
	  })
	} catch (error) {
	  console.log(error)
	  return res.status(500).json({
		success: false,
		error: error.message,
	  })
	}
  }


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY,      
  api_secret: process.env.API_SECRET  
});

exports.videoUpload = async (req, res) => {
  try {
    const { title, description, code, videoUrl ,userId,thumbnail,content, tags, category } = req.body;

    const newPost = new Post({
      title,
      description,
      code,
      videoUrl,
	  userId,
	  thumbnail,
	  content,
	  tags, category
    });

    await newPost.save();

    res.status(200).json({ success: true, message: "Post added successfully!" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Failed to add post." });
  }
};

exports.getAllUser = async (req, res) => {
    try {
        const allUser = await User.find().populate("additionalDetails"); 

        if (!allUser || allUser.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            allUser
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error, please try again.",
        });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { _id } = req.body;
        if (!_id) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            })
        }
        const user = await User.findByIdAndDelete(_id)

        return res.status(201).json({
            success: true,
            message: "User deleted.",
            user
        })
    } catch (error) {
        return res.status(501).json({
            success: false,
            message: "Somethings went wrong while deleting user."
        })
    }
}

exports.viewUser = async (req, res) => {
    try {
		const { _id } = req.params;

        const user = await Post.find({userId:_id})
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not exist."
            })
        }

        console.log("user", user);
        return res.status(200).json({
            success: true,
            message: "User get successfully.",
            user: user
        })

    } catch (error) {
        console.log(error.message);
        return res.status(404).json({
            success: false,
            message: "User not found.",
            error: error.message
        })
    }
}
exports.singleUser = async (req, res) => {
    try {
		const { _id } = req.params;

        const user = await User.findById({_id})
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not exist."
            })
        }

        console.log("user", user);
        return res.status(200).json({
            success: true,
            message: "Single User.",
            user: user
        })

    } catch (error) {
        console.log(error.message);
        return res.status(404).json({
            success: false,
            message: "User not found.",
            error: error.message
        })
    }
}
