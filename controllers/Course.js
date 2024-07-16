const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const cloudinary = require("cloudinary");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

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
      category,
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
      !thumbnail ||
      !category
    ) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //Instructor validation
    //i think userid and instrucotrdetails id are same i am just confused I will see it while testing the code
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
    const categoryDetails = await Category.findONe({ _id: category });
    if (!categoryDetails) {
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
      tag,
      category: categoryDetails._id,
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
    const updatedCategory = await Category.updateOne(
      {
        _id: category,
      },
      {
        $push: {
          courses: newCourse._id,
        },
      }
    );
    console.log(updatedCategory);
    //return the response
    res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });

    //return response
  } catch (e) {
    console.log("Error in creating the course");
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error in creating the course",
      error: e.message,
    });
  }
};

exports.getCourseDetail = async (req, res) => {
  try {
    const { courseId } = req.body;
    const courseDetails = await Course.findById(courseId)
      .populate({
        path: "instructor",
        populate: {
          path: "additionalDetails",
        },
      })
      .populate({
        path: "courseContent",
        populate: {
          path: 'subSection'
        }
      })
      .populate("ratingAndReviews")
      .populate("category")
      .populate("studentsEnrolled")
      .exec();

    console.log("Courses", courseDetails);
    if (!courseDetails) {
      res.status(400).json({
        success: false,
        message: "Course not found",
      });
    } else {
      res.status(200).json({
        success: true,
        message: "Course fetch successfully",
        course: courseDetails,
      });
    }
  } catch (e) {
    console.log("Error in fetching the course");
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error in fetching the course",
      error: e.message,
    });
  }
};
exports.showAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find(
      {},
      {
        courseName: true,
        price: true,
        instructor: true,
        thumbnail: true,
        ratingAndReviews: true,
        studentsEnrolled: true,
      }
    )
      .populate("instructor")
      .exec();

    console.log("Courses", allCourses);

    res.status(200).json({
      success: true,
      message: "Retrieved all the courses successflly",
      data: allCourses,
    });
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
