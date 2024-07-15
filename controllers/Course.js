const Course = require("../models/Course");
const Tag = require("../models/Tags");
const User = require("../models/User");
const cloudinary = require("cloudinary");
const { uploadImageToCloudinary } = require("../utils/imageUploader");

//Create course handler

exports.createCourse = async (req, res) => {
  try {
    //fetch data
    const { user } = req; //we added the user in during auth by payload
    const userId = user.id;
    const {
      courseName,
      courseDescription,
      // instructor,
      whatYouWillLearn,
      price,
      tag,
    } = req.body;
    //fetch file
    const thumbnail = req.files.thumbnailImage;
    //validation
    if (
      !courseName ||
      !courseDescription ||
      !instructor ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail
    ) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //Instructor validation
    const instructorDetails = await User.findOne({ _id: userId }); //it will always be found as we have authenticated already
    console.log("Instructor Details ", instructorDetails);
    if (!instructorDetails) {
      res.status(400).json({
        success: false,
        message: "Instructor not found",
        error: e.message,
      });
    }

    //Tag - valid
    const tagDetails = await Tag.findONe({ _id: tag });
    if (!tagDetails) {
      res.status(400).json({
        success: false,
        message: "Tag is not valid",
        error: e.message,
      });
    }
    //upload image on cloudinary
    const thumbnailImage = uploadImageToCloudinary(
      thumbnail,
      process.env.FOLDER_NAME
    );
    console.log(thumbnailImage);
    //create entry in course model

    const newCourse = await Course.create({
      courseName,
      courseDescription,
      instructor: instructorDetails._id,
      whatYouWillLearn,
      price,
      tag: tagDetails._id,
      thumbnail: thumbnailImage.secure_url,
    });
    //add course entry in the user
    const updatedUser = await User.updateOne(
      {
        _id: instructorDetails._id,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      }
    );
    console.log(updatedUser);
    //add course entry in the tag
    const updatedTag = await Tag.updateOne(
      {
        _id: tag,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      }
    );
    console.log(updatedTag);
    //return the response
    res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });

    //return response
  } catch (e) {
    console.log("Error in creating the tags");
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error in getting all the tags",
      error: e.message,
    });
  }
};
