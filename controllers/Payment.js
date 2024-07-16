const mongoose = require("mongoose");
const { instance } = require("../config/razorpay");
const Course = require("../models/Course");
const User = require("../models/User");
const { mailSender } = require("../utils/mailSender");

//2 cheez order initiate , verify the signature

//capture the payment and initiate the RazorPay order

exports.capturePayment = async (req, res) => {
  try {
    //get course id and user id
    //validation
    //validation course id
    //valid courseDetail
    //user already pay for the same course
    //create order
    //initiate the payment using razor pay
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      res.status(400).json({
        success: false,
        message: "Please provide course id",
      });
    }

    const courseDetails = await Course.findById(courseId);
    if (!courseDetails) {
      res.status(400).json({
        success: false,
        message: "Could not find the course",
      });
    }

    const studentsEnrolled = courseDetails.studentsEnrolled;
    //convert string to object id
    let uid = new mongoose.Schema.Types.ObjectId(userId);
    if (studentsEnrolled.include(uid)) {
      res.status(400).json({
        success: false,
        message: "User has already enrolled in the course",
      });
    }

    //create order
    const amount = courseDetails.price * 100;
    const currency = "INR";
    const options = {
      amount, // amount in smallest currency unit
      currency,
      receipt: `receipt_order_${Math.random().Date.now().toString()}`,
      //most needed
      notes: {
        courseId,
        userId,
      },
    };

    const order = await instance.orders.create(options);
    console.log(order);
    if (!order)
      return res.status(500).json({
        success: false,
        message: "Some error occured in payment gateway",
      });

    //return the response

    res.status(200).json({
      success: true,
      courseName: courseDetails.courseName,
      courseDescription: courseDetails.courseDescription,
      orderId: order.id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Route which razor pay will hit after successfull response
exports.verifySignature = async (req, res) => {
  const webHookSecret = "12345";

  //hashed krkr bheji hain usne -
  //BEHAVIOUR HAIN - THIS IS HOW THEY SEND THE SIGNATURE
  const signature = req.headers["x-razorpay-signature"];

  const shasum = crypto.createHmac("sha246", webHookSecret);

  shasum.update(JSON.stringify(req.body));

  const digest = shasum.digest("hex");

  if (signature === digest) {
    console.log("Payment is authorized");
    //payment is authorized so i have to do some action now -- enroll student in the course and also the user object

    console.log(req);
    console.log(req.body);
    console.log(req.body.payload);
    console.log(req);

    //how i will get the user and the course as the request is hit from the razor pay - thats i have put in the notes

    const { courseId, userId } = req.body.payload.payment.entity.notes;
    //enolling student in the coure

    try{
      const updatedCourse = await Course.findOneAndUpdate(
      { _id: courseId },
      {
        $push: {
          studentsEnrolled: userId,
        },
      },
      {
        new: true,
      }
    );

    if (!updatedCourse) {
      return res.status(500).json({
        success: false,
        message: "Course not found",
      });
    }
    console.log(updatedCourse);

    //find the studnt  and add course

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          courses: courseId,
        },
      },
      { new: true }
    );
    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "User not found",
      });
    }
    console.log(updatedUser);

   const emailResponse =  mailSender(
      updatedUser.email,
      "Enrolled in the course",
      `Hello ${updatedUser.name} , you have successfully enrolled for the ${updatedCourse.courseName}`
    );
    console.log(emailResponse);
    res.status(200).json({
      success: true , 
      message: "Signature verified and course id"
    })

    }catch(error){
      console.log(error);
      res.status(400).json({
        success: false , 
        message: error.message
      })
    }

    
  }
  else{
    res.status(400).json({
      success: false , 
      message: "Signature is not valid , Invalid Request"
    })
  }
};
