const Category = require("../models/Category");
const Course = require("../models/Course");

exports.createCategory = async (req, res) => {
  try {
    //fetch name and description
    const { name, description } = req.body;

    //validate
    if (!name || !description) {
      res.status(403).json({
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
      success: false,
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
    //fetch all the courses of that category
    const selectedCategory = await Category.findById(categoryId)
      .populate("courses")
      .exec();
    //if no course found - return false
    if (!selectedCategory) {
      res.status(404).json({
        success: true,
        message: "Sorry, There is no courses in this category",
        averageRating,
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
      return a.studentsEnrolled.length - b.studentsEnrolled.length;
    });

    //return responsse
    res.status(200).json({
      success: true,
      data: {
        selectedCategory,
        differentCategories,
        sortedCourses
      },
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error in categoryPageDetails",
    });
  }
};
