const Category = require("../models/Category");
const Course = require("../models/Course");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
exports.createCategory = async (req, res) => {
  try {
    //fetch name and description
    const { name, description } = req.body;

    //validate
    if (!name || !description) {
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }
    //push krdo in database
    const category = await Category.create({
      name,
      description,
    });
    console.log(category);
    res.status(200).json({
      success: true,
      message: `${name} category created successfully`,
    });
  } catch (e) {
    console.log("Error in creating category");
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error in creating category",
    });
  }
};

exports.showAllCategory = async (req, res) => {
  try {
    //take from db
    const allCategory = await Category.find(
      {},
      {
        name: true,
        description: true,
      }
    );
    res.status(200).json({
      success: true,
      data: allCategory,
      message: "All Categories are returned successfully",
    });
  } catch (error) {
    console.log("Error in getting all the category");
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error in getting all the category",
    });
  }
};
//I need the category page details
//most popular ocurse
//top selling course
//frequently brought togethter
exports.categoryPageDetails = async (req, res) => {
  try {
    //get category id
    const { categoryId } = req.body;
    if (!categoryId) {
      return res.status(404).json({
        success: true,
        message: "Please provide the course id",
      });
    }
    // Check if categoryId is a valid MongoDB ObjectId //otherWise it will throw error
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category id",
      });
    }

    //fetch all the courses of that category
    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();

    console.log("Selected category");
    console.log(selectedCategory);
    //if no course found - return false
    if (!selectedCategory) {
      return res.status(404).json({
        success: true,
        message: "Sorry, There is no courses in this category",
      });
    }
    // get course for different categories

    const differentCategories = await Category.find({
      _id: {
        $ne: categoryId,
      },
    })
      .populate("courses")
      .exec();
    //get top 8 selling course ? how to find
    //Check maximum users in the particular course  sort on the basis of it
    const allCourses = await Course.find({})
      .populate("studentsEnrolled")
      .exec();
    //it has array of courses i want to sort it on the basis of length of studentsEnroolled

    const sortedCourses = allCourses.sort((a, b) => {
      return b.studentsEnrolled.length - a.studentsEnrolled.length;
    }).slice(0,8) //get top 8courses
    console.log("Sorted courses");
    console.log(sortedCourses);

    //return responsse
    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategories,
        sortedCourses,
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error in category page Details",
    });
  }
};
