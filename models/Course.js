const mongoose = require("mongoose");

const courseSchema = mongoose.Schema({
  courseName: {
    type: String,
  },
  courseDescription: {
    type: String,
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  whatYouWillLearn: {
    type: String,
  },
  courseContent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section",
  }],
  ratingAndReviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "RatingAndReview",
  }],
  price: {
    type: Number,
  },
  thumbnail: {
    type: String,
  },
  tag: {
    type: String,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  studentsEnrolled: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

module.exports = mongoose.model("Course", courseSchema);
