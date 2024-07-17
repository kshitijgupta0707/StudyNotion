const Section = require("../models/Section");
const Course = require("../models/Course");
const  mongoose  = require("mongoose");
//how will i get the id of the course to put inside it
//how will i get the id of the section to update it
//how woll i
exports.createSection = async (req, res) => {
  try {
    //fetch
    const { sectionName, courseId } = req.body;
    //validate
    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: true,
        message: "Missing details",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      console.log("i got in it");
      return res.status(400).json({
        success: false,
        message: "Course not found",
      });
    }
    //create it
    const section = await Section.create({
      sectionName,
    });

    //update course with section object id
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: section._id,
        },
      },
      {
        new: true,
      }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSections",
        },
      })
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
    // Fetch
    const { sectionId, sectionName } = req.body;

    // Validate
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Fill all the details",
      });
    }

    // Check if the section ID is valid
    if (!mongoose.Types.ObjectId.isValid(sectionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section ID",
      });
    }

    // Update the section
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true } // Return the updated document
    ).populate("subSections");

    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not found",
      });
    }

    // Return response
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
    const { sectionId, courseId } = req.body; //sending id in params

    // Validate section ID
    if (
      !mongoose.Types.ObjectId.isValid(sectionId) ||
      !mongoose.Types.ObjectId.isValid(courseId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Id's",
      });
    }
    //delete from the course
    const updateCourse = await Course.findByIdAndUpdate(courseId , 
      {
        $pull:{
          courseContent: sectionId
        }
      }
    )
    // Find and delete the section
    const section = await Section.findByIdAndDelete(sectionId);
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
