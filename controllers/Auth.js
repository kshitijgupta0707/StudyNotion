//send otp

//email in request and send the otp to it

//creating at otp
const otpGenerator = require("otp-generator");
// const OTP =  require("../models/OTP");
const User = require("../models/User");
const OTP = require("../models/Otp");
const bcrypt = require("bcrypt");

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
        message: "Otp not found",
      });
    }

    //compare otp
    if (otp !== recentOtp.otp) {
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
  
     const profileDetails = await Profile.create({
        gender: null , 
        dateOfBirth:null , 
        about: null , 
        contactNumber: null
     });




    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType,
      contactNumber,
      additionalDetails: profileDetails._id,
    //   image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}+${lastName}`,
      image: `https://ui-avatars.com/api/?background=random&name=${firstName}+${lastName}`,
    });

    return res.status(200).json({
      success: true,
      user: user,
      message: "User created successfully",
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

//changePassword
