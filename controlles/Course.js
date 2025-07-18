const Course = require('../models/Course');
const User = require('../models/User');
const { uploadImageToCloudinary } = require('../utils/imageUploder');
const { convertSecondsToDuration } = require('../utils/SecToDuration');
const Post = require('../models/Post');


exports.createCourse = async (req, res) => {
  try {
  
    const {userId} = req.params;

    // Get all required fields from request body
    let {
      courseName,
      courseDescription,
      whatYouWillLearn,
      price,
      tag: _tag,
      category,
      status,
      instructions: _instructions,
    } = req.body
    // Get thumbnail image from request files
    const thumbnail = req.files.thumbnailImage;

    // Convert the tag and instructions from stringified Array to Array
    const tag = JSON.parse(_tag)
    const instructions = JSON.parse(_instructions)

    console.log("tag", tag)
    console.log("instructions", instructions)

    // Check if any of the required fields are missing
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag.length ||
      !thumbnail ||
      !category ||
      !instructions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "All Fields are Mandatory",
      })
    }
    if (!status || status === undefined) {
      status = "Draft"
    }
    // Check if the user is an instructor
    // const instructorDetails = await User.findById(userId, {
    //   accountType: "Instructor",
    // })

    // if (!instructorDetails) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Instructor Details Not Found",
    //   })
    // }

    // Check if the tag given is valid
    // const categoryDetails = await Category.findById(category)
    // if (!categoryDetails) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "Category Details Not Found",
    //   })
    // }
    // Upload the Thumbnail to Cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    )
    console.log(thumbnailImage)
    // Create a new course with the given details
    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn: whatYouWillLearn,
      price,
      tag,
      category: categoryDetails._id,
      thumbnail: thumbnailImage.secure_url,
      status: status,
      instructions,
    })

    console.log(newCourse.thambnail,"imgggggggggggggggggggggggggggg")

    // Add the new course to the User Schema of the Instructor
    await User.findByIdAndUpdate(
      {
        _id: instructorDetails._id,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    )
    // Add the new course to the Categories
    const categoryDetails2 = await Category.findByIdAndUpdate(
      { _id: category },
      {
        $push: {
          courses: newCourse._id,
        },
      },
      { new: true }
    )
    console.log("HEREEEEEEEE", categoryDetails2)
    // Return the new course and a success message
    res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    })
  } catch (error) {
    // Handle any errors that occur during the creation of the course
    console.error(error)
    res.status(500).json({
      success: false,
      message: "Failed to create course",
      error: error.message,
    })
  }
}


exports.getAllCourses = async (req, resp) => {
    try {

      const allCourse = await Post.find()
      .populate('userId') 
      .populate('comments.userId'); 
    

        return resp.status(200).json({
            success: true,
            message: "All  PostFeed Fetch Successfully..",
            posts: allCourse,
        })
    }
    catch (error) {
        console.log(error)
        return resp.status(500).json({
            success: false,
            message: "Can't fetch All data"
        })
    }
}


// getCourseDetails


exports.getCourseDetails = async (req, resp) => {
    try {
        const { courseId } = req.body;


        // find course details 
        const courseDetails = await Course.find({ _id: courseId })
            .populate({
                path: "instructor",
                populate: {
                    path: "additionalDetails",
                }
            })
            .populate("category")
            .populate("RatingAndReview")
            .populate({
                path: "courseContent",
                populate: {
                    path: "subSection",
                }
            }).exec();
        // validate
        if (!courseDetails) {
            return resp.status(400).json({
                success: false,
                message: `could not find the course with ${courseId}`
            })
        }

        return resp.status(200).json({
            success: true,
            message: `Course fetch successfully `,
            data:courseDetails,
        })
        


    } catch (error) {
        console.log(error)
        return resp.json({
            success: false,
            message:error.message,
        })
    }
}



exports.getFullCourseDetails = async (req, res) => {
    try {
      const { courseId } = req.body
      const userId = req.user.id
      const courseDetails = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("RatingAndReview")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      let courseProgressCount = await CourseProgress.findOne({
        courseID: courseId,
        userId: userId,
      })
  
      console.log("courseProgressCount : ", courseProgressCount)
  
      if (!courseDetails) {
        return res.status(400).json({
          success: false,
          message: `Could not find course with id: ${courseId}`,
        })
      }
  
      // if (courseDetails.status === "Draft") {
      //   return res.status(403).json({
      //     success: false,
      //     message: `Accessing a draft course is forbidden`,
      //   });
      // }
  
      let totalDurationInSeconds = 0
      courseDetails.courseContent.forEach((content) => {
        content.subSection.forEach((subSection) => {
          const timeDurationInSeconds = parseInt(subSection.timeDuration)
          totalDurationInSeconds += timeDurationInSeconds
        })
      })
  
      const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
  
      return res.status(200).json({
        success: true,
        data: {
          courseDetails,
          totalDuration,
          completedVideos: courseProgressCount?.completedVideos
            ? courseProgressCount?.completedVideos
            : [],
        },
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }

  exports.editCourse = async (req, res) => {
    try {
      const { courseId } = req.body
      const updates = req.body
      const course = await Course.findById(courseId)
  
      if (!course) {
        return res.status(404).json({ error: "Course not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update")
        const thumbnail = req.files.thumbnailImage
        const thumbnailImage = await uploadImageToCloudinary(
          thumbnail,
          process.env.FOLDER_NAME
        )
        course.thumbnail = thumbnailImage.secure_url
      }
  
      // Update only the fields that are present in the request body
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          if (key === "tag" || key === "instructions") {
            course[key] = JSON.parse(updates[key])
          } else {
            course[key] = updates[key]
          }
        }
      }
  
      await course.save()
  
      const updatedCourse = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("RatingAndReview")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }

  exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id
  
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 })
  
      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
  }

  exports.deleteCourse = async (req, res) => {
    try {
      const { courseId } = req.body
  
      // Find the course
      const course = await Course.findById(courseId)
      if (!course) {
        return res.status(404).json({ message: "Course not found" })
      }
  
      // Unenroll students from the course
      const studentsEnrolled = course.studentsEnrolled
      for (const studentId of studentsEnrolled) {
        await User.findByIdAndUpdate(studentId, {
          $pull: { courses: courseId },
        })
      }
  
      // Delete sections and sub-sections
      const courseSections = course.courseContent
      for (const sectionId of courseSections) {
        // Delete sub-sections of the section
        const section = await Section.findById(sectionId)
        if (section) {
          const subSections = section.subSection
          for (const subSectionId of subSections) {
            await SubSection.findByIdAndDelete(subSectionId)
          }
        }
  
        // Delete the section
        await Section.findByIdAndDelete(sectionId)
      }
  
      // Delete the course
      await Course.findByIdAndDelete(courseId)
  
      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "Server error",
        error: error.message,
      })
    }
  }

  // >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


// Like a post
exports.like =  async (req, res) => {
  const { postId, userId } = req.body;

  try {
    const post = await Post.findById(postId);

    if (post.likes.includes(userId)) {
      return res.status(400).json({ success: false, message: 'You have already liked this post' });
    }

    post.likes.push(userId);

    await post.save();

    res.json({
      success: true,
      message: 'Post liked successfully',
      post
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error liking the post' });
  }
};

// Unlike a post
exports.dislike = async (req, res) => {
  const { postId, userId } = req.body;

  try {
    const post = await Post.findById(postId);

    // Check if the user has already liked the post
    if (!post.likes.includes(userId)) {
      return res.status(400).json({ success: false, message: 'You have not liked this post' });
    }

    post.likes = post.likes.filter(like => like.toString() !== userId.toString());

    await post.save();

    res.json({ success: true, message: 'Post unliked successfully', post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error unliking the post' });
  }
};

// Add a comment to a post
exports.comment= async (req, res) => {
  const { postId, userId, text } = req.body;
  console.log(postId,userId)

  try {
    const post = await Post.findById(postId);

    const newComment = {
      userId,
      text,
    };

    post.comments.push(newComment);

    // Save the post
    await post.save();

    res.json({ 
      success: true,
       message: 'Comment added successfully',
        post });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error adding comment' });
  }
};

// Fetch all posts with likes and comments
exports.posts = async (req, res) => {
  try {
    const posts = await Post.find().populate('likes').populate('comments.userId');  
    res.json({ success: true, posts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error fetching posts' });
  }
};

