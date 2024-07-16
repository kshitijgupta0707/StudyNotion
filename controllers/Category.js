const Category = require("../models/Category");

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
