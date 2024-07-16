const mongoose = require("mongoose");
const RatingAndReview = require("../models/RatingAndReview");
const Course = require("../models/Course");

exports.createRating = async (req, res) => {
  try {
    //fetchDate
    const { rating, review, courseId } = req.body;
    //get userId
    const userId = req.user.id;
    //validation
    if (!rating || !review || !courseId) {
      res.status(500).json({
        success: false,
        message: "Send all the required details",
      });
    }
    //check whether the user has enrolled foir the course or not

    const userExists = await Course.findOne({
      _id: courseId,
      studentsEnrolled: {
        $elemMatch: {
          $eq: userId,
        },
      },
    });
    if (!userExists) {
      res.status(400).json({
        success: false,
        message: "User has not enrolled in the course",
      });
    }

    //basic code

    // const getCourse = await Course.findById(courseId)
    //   .populate("ratingAndReviews")
    //   .exec();
    // const users = getCourse.studentsEnrolled;
    // const userExists = users.include(userId);
    // if (!userExists) {
    //   res.status(400).json({
    //     success: false,
    //     message: "User has not enrolled in the course",
    //   });
    // }

    //check whether the user has already review the course

    const alreadyRated = await RatingAndReview.findOne({
      user: userId,
      course: courseId,
    });

    if (alreadyRated) {
      res.status(403).json({
        success: false,
        message: "User has already rated the course",
      });

      // const allRatings = getCourse.ratingAndReviews;
      // let alreadyRated = false;
      // for (let i = 0; i < allRatings.length; i++) {
      //   if (allRatings[i].user == userId) {
      //     alreadyRated = true;
      //     break;
      //   }
      // }
      // if (alreadyRated) {
      //   res.status(400).json({
      //     success: false,
      //     message: "User has already rated the course",
      //   });
    }

    const createdRating = await RatingAndReview.create({
      rating,
      review,
      course: courseId,
      user: userId,
    });
    console.log("Rating created ", createdRating);

    //push in course ratingAndReviews

    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          ratingAndReviews: createdRating._id,
        },
      },
      {
        new: true,
      }
    );
    console.log(updatedCourse);

    res.status(200).json({
      success: true,
      message: "Rating successfully posted on the course",
    });
  } catch (e) {
    console.log("error in creating rating");
    console.log(e.message);
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

exports.getAverageRating = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      res.status(500).json({
        success: false,
        message: "Send all the required details",
      });
    }
    //fetch course
    const fetchedCourse = await Course.findById(courseId)
      .populate("ratingAndReviews")
      .exec();
    console.log(fetchedCourse);
    if (!fetchedCourse) {
      res.status(400).json({
        success: false,
        message: "Course does not exists",
      });
    }

    //it has arrays of objects of rating so i want to fetch rating from all the user

    const result = await RatingAndReview.aggregate(
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
        },
      },
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: "$rating",
          },
        },
      }
    );
    console.log(result);
    if (result.length > 0) {
      res.status(200).json({
        success: true,
        message: "Average Rating successfully fetched from the course",
        averageRating: result[0].averageRating,
      });
    } else {
      res.status(200).json({
        success: true,
        message: "No one has rated the course till now",
        averageRating: "0",
      });
    }

    //basic code
    // const ratings = fetchedCourse.ratingAndReviews;
    // console.log(ratings);
    // let averageRating = 0;
    // for (let i = 0; i < ratings.length; i++) {
    //   averageRating += ratings[i].rating;
    // }
    // averageRating /= ratings.length;
    // console.log(averageRating);

    // res.status(200).json({
    //   success: true,
    //   message: "Average Rating successfully fetched from the course",
    //   averageRating,
    // });
  } catch (e) {
    console.log("error in fetching rating");
    console.log(e.message);
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};
exports.getAllRatingOfParticularCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      res.status(500).json({
        success: false,
        message: "Send all the required details",
      });
    }
    //fetch course
    const fetchedCourse = await Course.findById(courseId)
      .populate("ratingAndReviews")
      .exec();
    console.log(fetchedCourse);
    const ratings = fetchedCourse.ratingAndReviews;
    console.log(ratings);

    res.status(200).json({
      success: true,
      message: "Rating successfully fetched from the course",
      ratings,
    });
  } catch (e) {
    console.log("error in fetching rating");
    console.log(e.message);
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};
exports.getAllRating = async (req, res) => {
  try {
    //fetch course
    const allReviews = await RatingAndReview.find({})
      .sort({ rating: "desc" })
      .populate({
        path: "user",
        select: "firstName lastName email image",
      })
      .populate({
        path: "course",
        select: "courseName",
      })
      .exec();
    console.log(allReviews);

    res.status(200).json({
      success: true,
      message: "All reviews fetched successfully",
      data: allReviews,
    });
  } catch (e) {
    console.log("error in fetching rating");
    console.log(e.message);
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};
