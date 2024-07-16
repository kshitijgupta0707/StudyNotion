//create subsection
//update subsection
//delete subsection
const Section = require("../models/Section");
const SubSection = require("../models/SubSection");
const { uploadImageToCloudinary } = require("../utils/imageUploader");
require("dotenv").config();

exports.createSubSection = async (req, res) => {
  try {
    //fetch data
    const { title, description, time, sectionId } = req.body;
    //fetch file
    const video = req.files.videoFile;
    //validate
    if (!title || !description || !time || !video) {
      res.status(400).json({
        success: false,
        message: "Send all the data and the file for creating the section",
      });
    }

    //upload video to cloudinary and get the link
    const uploadedVideo = uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    const videoUrl = uploadedVideo.secure_url;

    //upload to the server
    const subsection = await SubSection.create({
      title,
      description,
      time: time,
      videoUrl,
    });

    //add to the section But kismein how would i know ??
    const updatedsection = await Section.update(
      {
        _id: sectionId,
      },
      {
        $push: {
          subSections: subsection._id,
        },
      },
      {
        new: true,
      }
    )
      .populate("SubSection")
      .exec();
    console.log(updatedsection);
    //return the response
    res.status(200).json({
      success: true,
      message: "Subsection created successfully",
      updatedsection,
    });
  } catch (e) {
    console.log("Error in creating the subsection");
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error in creating the subsection",
      error: e.message,
    });
  }
};
exports.updateSubSection = async (req, res) => {
  try {
    //fetch data
    const { id, title, description, time } = req.body;
    //fetch file
    const video = req.files.videoFile;
    //validate
    if (!title || !description || !time || !video) {
      res.status(400).json({
        success: false,
        message: "Send all the data and the file for updatingu the section",
      });
    }

    //upload video to cloudinary and get the link
    const uploadedVideo = uploadImageToCloudinary(
      video,
      process.env.FOLDER_NAME
    );
    const videoUrl = uploadedVideo.secure_url;

    //upload to the server
    const subsection = await SubSection.update(
      { _id: id },
      {
        title,
        description,
        time,
        videoUrl,
      },
      {
        new: true,
      }
    );
    console.log(subsection);

    //return response
    res.status(200).json({
      success: true,
      message: "Subsection updated successfully",
      subsection
    });
  } catch (e) {
    console.log("Error in creating the subsection");
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error in creating the subsection",
      error: e.message,
    });
  }
};
exports.deleteSubSection = async (req, res) => {
  try {
    //fetch data
    const { id } = req.body;

    //update to the server
    const subsection = await SubSection.delete({ _id: id });

    //Delete from the section
    res.status(200).json({
      success: true,
      message: "Subsection deleted successfully",
    });
    
    // Check if it is deleted automatciallyt from section or we have to delete from there


  } catch (e) {
    console.log("Error in Deleting the subsection");
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Error in Deleting the subsection",
      error: e.message,
    });
  }
};
