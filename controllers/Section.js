const Section = require("../models/Section");
const Course = require("../models/Course");
//how will i get the id of the course to put inside it
//how will i get the id of the section to update it
//how woll i
exports.createSection = async (req, res) => {
  try {
    //fetch
    const { sectionName, courseId } = req.body;
    //validate
    if (!sectionName || !courseId) {
      res.status(400).json({
        success: true,
        message: "Missing details",
      });
    }
    //create it
    const section = await Section.create({
      sectionName,
    });

    //update course with section object id
    const updatedCourse = await Course.update(
      {
        _id: courseId,
      },
      {
        $push: {
          courseContent: section._id,
        },
      },
      {
        new: true,
      }
    )
      .populate("Section")
      .populate("SubSection")
      .exec();

    // return response
    res.status(200).json({
      success: true,
      message: "Section created successfully",
      course: updatedCourse,
    });
  } catch (e) {
    console.log("Error in creating Section");
    console.error(e.message);
    res.status(500).json({
      success: false,
      message: "Error in creating section",
    });
  }
};
exports.updateSection = async (req, res) => {
  try {
    //fetch
    const { sectionId, sectionName } = req.body;
    //validate
    if (!sectionName || !sectionId) {
      res.status(400).json({
        success: true,
        message: "Fill all the details",
      });
    }
    //create it
    const section = await Section.update(
      {
        _id: sectionId,
      },
      {
        sectionName,
      },
      {
        new: true,
      }
    ).populate("SubSection");
    // return response
    res.status(200).json({
      success: true,
      message: "Section updated successfully",
      section: section,
    });
  } catch (e) {
    console.log("Error in updating Section");
    console.error(e.message);
    res.status(500).json({
      success: false,
      message: "Error in updating section",
    });
  }
};
exports.deleteSection = async (req, res) => {
  try {
    //fetch
    const { sectionId } = req.params; //sending id in params
    const section = await Section.delete({
      _id: sectionId,
    });
    //delete from the course



    //do we need to deleted the entry from the course schema? check while testing




    // return response
    res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      section,
    });







  } catch (e) {
    console.log("Error in deleting Section");
    console.error(e.message);
    res.status(500).json({
      success: false,
      message: "Error in deleting section",
    });
  }
};
