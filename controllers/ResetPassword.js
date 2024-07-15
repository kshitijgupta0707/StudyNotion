//reset krna hian

// email id pe front end ka link bhejege

// password daaldo

//Databse mein change krlia

const User = require("../models/User");
const { mailSender } = require("../utils/mailSender");
const bcrypt = require("bcrypt");
//resetPasswordToken

exports.resetPasswordToken = async (req, res) => {
  try {
    //fetch data
    const { email } = req.body;

    //validation on email
    if (!email) {
      res.status(400).json({
        success: false,
        message: "Enter the email",
      });
    }
    //check user exist or not
    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({
        success: false,
        message: "User is not registered with this email",
      });
    }

    //generate token / link which we will send you email with expiration time
    const token = crypto.randomUUID();
    console.log("token: ", token);
    //update user by  adding token and expiration time //why? ----->

    const updatedUser = await User.updateOne(
      { email },
      {
        token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      {
        new: true,
      }
    );
    console.log("updated user is ");
    console.log(updatedUser);
    //create url
    const url = `http://localhost:3000/update-password/${token}`;

    //send mail containing the url
    mailSender(
      email,
      "Password Reset Link",
      ` Link to reset the password : ${url} . It will expire in 5 minute`
    );
    //return response

    return res.stauts(200).json({
      success: true,
      message: "Reset password link send successsfully",
    });
  } catch (e) {
    console.log("Error in reset password");
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Something went wrong while resetting password",
    });
  }
};

//resetPassword

exports.resetPassword = async (req, res) => {
  try {
    //fetch new password , confirm newPassword , and token
    const { password, confirmPassword, token } = req.body; //front end se daaldia

    //validation
    if (passwords != confirmPassword) {
      res.status(400).json({
        success: false,
        message: "Password not matching",
      });
    }

    //get user details from db by using token
    const user = await User.findOne({ token });

    //if No details -- invalid token

    if (!user) {
      res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    //if time expires -- invalid token
    if (Date.now() > user.resetPasswordExpires) {
      res.status(400).json({
        success: false,
        message: "Your Token has expired , try again",
      });
    }

    //hash the password
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

    //update password
    const updatedUser = await User.updateOne(
      {
        token,
      },
      {
        password: hashedPassword,
      }
    );

    //return response
    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (e) {
    console.log("Error in updating password");
    console.log(e);
    res.status(500).json({
      success: true,
      message: "Issue in updating password , pkease try again later",
    });
  }
};
