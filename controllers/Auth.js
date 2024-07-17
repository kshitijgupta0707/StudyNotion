//send otp

//email in request and send the otp to it

//creating at otp
const otpGenerator = require("otp-generator");
// const OTP =  require("../models/OTP");
const User = require("../models/User");
const OTP = require("../models/Otp");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { mailSender } = require("../utils/mailSender");
require("dotenv").config();
const Profile = require("../models/Profile");

//sign in

//fetch
//check everuything fill
//check already existing
//hash the password
//save the data

exports.sendOtp = async (req, res) => {
  try {
    //fetch email from the request body
    const { email } = req.body;

    //check if user already exists
    const existingUser = await User.findOne({ email });

    //if user already exist , then return a respoonse
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already registered",
      });
    }

    //generate otp
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    console.log("otp generated ", otp);

    //check unique otp or not
    const result = await OTP.findOne({ otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        specialChars: false,
        lowerCaseAlphabets: false,
      });
      console.log("otp generated ", otp);
      result = await OTP.findOne({ otp });
    }

    //create an entry in db for otp
    const otpPayLoad = { email, otp };
    const otpBody = await OTP.create(otpPayLoad);
    console.log(otpBody);

    //return succesfull response
    return res.status(200).json({
      success: true,
      message: "Otp sent successfully",
      otp,
    });
  } catch (e) {
    console.log("Error in sending otp");
    console.log(e);
    return res.status(400).json({
      success: false,
      message: "Otp not generated",
      error: e,
    });
  }
};

exports.signup = async (req, res) => {
  try {
    //fetch data
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;

    //Validate
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      console.log("Fill all the fields");
      return res.status(403).json({
        success: false,
        message: "All fields are required",
      });
    }

    //Compare password
    if (password != confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password not matches  , please try again",
      });
    }

    //check if user already exist
    //use find one it gives an single object
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    //find the most recent stored for the user

    const recentOtp = await OTP.find({ email })
      .sort({
        createdAt: -1,
      })
      .limit(1);

    console.log("Recent otp", recentOtp);

    //validate otp
    if (recentOtp.length == 0) {
      //otp not found
      return res.status(400).json({
        success: false,
        message: "Otp is expired",
      });
    }
    console.log(otp);
    console.log(recentOtp[0].otp);
    //compare otp
    if (otp != recentOtp[0].otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid otp",
      });
    }

    //secure the password
    //Retry startegy to hash password for atleast three times
    let tryy = 0;
    let hashedPassword;
    while (tryy < 3) {
      try {
        hashedPassword = await bcrypt.hash(password, 10);
        if (hashedPassword) break;
      } catch (e) {
        tryy++;
        if (tryy == 3) {
          return res.status(500).json({
            success: false,
            data: "Error in hashing passwrord",
          });
        }
      }
    }

    //entry in db
    let approved = "";
    approved === "Instructor" ? (approved = false) : (approved = true);
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      contactNumber,
      additionalDetails: profileDetails._id,
      approved: approved,
      //   image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}+${lastName}`,
      image: `https://ui-avatars.com/api/?background=random&name=${firstName}+${lastName}`,
    });

    return res.status(200).json({
      success: true,
      user: user,
      message: "User is registered successfully",
    });
  } catch (e) {
    console.log("Issue in creating the user");
    console.error(e);
    res.status(500).json({
      success: false,
      data: "User cannot be register ,  please try again later",
    });
  }
};

//log in
exports.login = async (req, res) => {
  try {
    //get data
    const { email, password } = req.body;

    //validation on email and password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fills all the details",
      });
    }

    //check whethrer user exists or not
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        success: false,
        data: "User is not registered , Please Sign up",
      });
    }

    //now verify the password
    if (await bcrypt.compare(password, user.password)) {
      // Password is matched, now create JWT token and send with response

      const payLoad = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };

      const token = jwt.sign(payLoad, process.env.JWT_SECRET, {
        expiresIn: "1h", // Token expiration time
      });
      // Create response object without password

      //   const responseUser = {
      //     id: user._id,
      //     name: user.name,
      //     email: user.email,
      //     role: user.role,
      //     token: token,
      //   };
      user.token = token;
      user.password = undefined;
      console.log("updated user");
      console.log(user);
      //creating a cookie
      let options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "User logged in successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        data: "Password incorrect",
      });
    }
  } catch (e) {
    console.error(e);
    res.status(400).json({
      success: false,
      data: "Login failed , Please try again later",
    });
  }
};

exports.changePassword = async (req, res) => {
  //fetch old and new password
  const { email, oldPassword, newPassword, confirmNewPassword } = req.body;

  //validate
  if (!email || !oldPassword || !newPassword || !confirmNewPassword) {
    return res.status(400).json({
      success: false,
      message: "Enter all the details",
    });
  }
  //compare cofirm
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({
      success: false,
      message: "New Password doesn't matches",
    });
  }
  //check old password is correct
  const user = await User.findOne({ email: email });
  console.log(user);
  if (!user) {
    return res.status(400).json({
      success: false,
      message: "User not exists",
    });
  }

  //compare mthod
  if (await bcrypt.compare(oldPassword, user.password)) {
    //if match

    //now hash the new password
    let tryy = 0;
    let hashedPassword;
    while (tryy < 3) {
      try {
        hashedPassword = await bcrypt.hash(newPassword, 10);
        if (hashedPassword) break;
      } catch (e) {
        tryy++;
        if (tryy == 3) {
          return res.status(500).json({
            success: false,
            data: "Error in hashing passwrord",
          });
        }
      }
    }

    //then Update the new password

    const updatedUser = await User.updateOne(
      { email },
      {
        password: hashedPassword,
      }
    );
    const male = mailSender(
      email,
      "Change Password",
      "Password changed successfully"
    );
    console.log(male);

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      user: updatedUser,
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Enter the old Password correctly",
    });
  }
};
//delete Account
exports.deleteAccount = async (req, res) => {
  try {
    //get id
    const id = req.user.id;
    //check valid id

    const userDetails = await User.findById(id);
    if (!userDetails) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    //unenroll user from all enrolled courses

    //delete user profile
    await Profile.findByIdAndDelete(userDetails.additionalDetails);

    //delete user

    await User.findByIdAndDelete(id);

    //return response
    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  } catch (e) {
    console.log("Error in Deleting account");
    console.error(e.message);
    res.status(500).json({
      success: false,
      error: e.message,
      message: "Error in deleting account",
    });
  }
};
