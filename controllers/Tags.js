const Tag = require("../models/Tags");

exports.createTag = async (req, res) => {
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
    const tag = await Tag.create({
      name,
      description,
    });
    console.log(tag);
    res.status(200).json({
      success: true,
      message: `${name} tag created successfully`,
    });
  } catch (e) {
    console.log("Error in creating tag");
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error in creating tag",
    });
  }
};

exports.showAllTags = async (req, res) => {
  try {
    //take from db
    const allTags = await Tag.find(
      {},
      {
        name: true,
        description: true,
      }
    );
    res.status(200).json({
      success: false,
      data: allTags,
      message: "All tags returned successfully",
    });
  } catch (error) {
    console.log("Error in getting all the tags");
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error in getting all the tags",
    });
  }
};
