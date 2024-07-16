const Profile = require("../models/Profile");
const User = require("../models/User");

exports.updateProfile = async (req, res) => {
  try {
    //get Data
    const { dateOfBirth = "", about = "", gender, contactNumber } = req.body;

    //if user is logged in so we have already added the user in req in authentication
    //fetch user
    const userId = req.user.id;

    //Validate
    if (!gender || !contactNumber) {
      res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //get additionalDetialsId in user object

    const user = await User.findById(userId);
    const profileId = user.additionalDetails;

    //now update the profile
    const profileDetails = await Profile.findById(profileId);

    profileDetails.gender = gender;
    profileDetails.dateOfBirth = dateOfBirth;
    profileDetails.about = about;
    profileDetails.contactNumber = contactNumber;

    await profileDetails.save();
    //return the response
    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      profileDetails,
    });
  } catch (e) {
    console.log("Error in editing profile");
    console.error(e.message);
    res.status(500).json({
      success: false,
      message: "Error in editing profile",
      error: e.message,
    });
  }
};

exports.getAllUserDetails = async (req, res) => {
  try {
    const id = req.user.id;

    //find user
    const user = await User.findById(id).populate("additionalDetails").exec();

    return res.status(200).json({
      success: true,
      message: "User data fetched successfully",
      user,
    });
  } catch (e) {
    console.log("Error in getting user details");
    console.error(e.message);
    res.status(500).json({
      success: false,
      message: "Error in getting user Details",
      error: e.message,
    });
  }
};
