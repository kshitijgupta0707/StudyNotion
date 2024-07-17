const Course = require("../models/Course");
const Category = require("../models/Category");
const User = require("../models/User");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
const { default: mongoose } = require("mongoose");
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
      whatYouWillLearn,
      price,
      tag,
      category,
    } = req.body;
    //fetch file
    let thumbnail;
    if (req.files.thumbnailImage) thumbnail = req.files.thumbnailImage;
    //validation
    if (
      !courseName ||
      !courseDescription ||
      !whatYouWillLearn ||
      !price ||
      !tag ||
      !thumbnail ||
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    //Instructor validation
    //i think userid and instrucotrdetails id are same i am just confused I will see it while testing the code
    const instructorDetails = await User.findOne({ _id: userId }); //it will always be found as we have authenticated already
    console.log("Instructor Details ", instructorDetails);
    if (!instructorDetails) {
      return res.status(400).json({
        success: false,
        message: "Instructor not found",
        error: e.message,
      });
    }

    //Tag - valid
    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Category is not valid",
      });
    }
    const categoryDetails = await Category.findOne({ _id: category });
    //upload image on cloudinary
    const thumbnailImage = await uploadImageToCloudinary(
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
    return res.status(200).json({
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
    if(!mongoose.Types.ObjectId.isValid(courseId)){
        return res.status(400).json({
          success: false,
          message: "Course not found",
        });
    }
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
          path: "subSections",
        },
      })
      .populate("ratingAndReviews")
      .populate("category")
      .populate("studentsEnrolled")
      .exec();

    console.log("Courses", courseDetails);
 
      return res.status(200).json({
        success: true,
        message: "Course fetch successfully",
        course: courseDetails,
      });
    
  } catch (e) {
    console.log("Error in fetching the course");
    console.error(e);
    return res.status(500).json({
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
