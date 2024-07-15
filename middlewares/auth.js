//auth

//isStudent


//isInstructor


//isAdmin
///i am making three middleware which will intercept the request and first authenticate and then authorize


const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require('../models/User')
exports.auth = (req, res, next) => {
  try {
    //extract jwt token from request or token or from header

    //pending other ways to fetch token

    console.log("Cookie token", req.cookies.token);
    console.log("body     ", req.body.token);
    console.log("header", req.header("Authorization"));

    const token =
      req.body.token ||
      req.cookies.token || 
      req.header("Authorizaton").replace("Bearer ", "");
     

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "token missing",
      });
    }

    //verify the token
    try {
      var decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoding");
      console.log(decode);

      //   why this ?

      req.user = decode;
    } catch (e) {
      console.error(e);
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    //calling the next middle ware
    next();
  } catch (e) {
    console.error(e);
    res.status(401).json({
      success: false,
      message: "Something went wrong while verifying the token",
    });
  }
};

exports.isStudent = (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for student",
      });
    }

    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "User role is not matching",
    });
  }
};

exports.isAdmin = (req, res, next) => {
  try {
    console.log(req.user);
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Admin",
      });
    }

    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "User role is not matching",
    });
  }
};
exports.isInstructor = (req, res, next) => {
  try {
    console.log(req.user);
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for Instructor",
      });
    }
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "User role is not matching",
    });
  }
};
