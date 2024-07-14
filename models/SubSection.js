const mongoose = require("mongoose");
const subSectionSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  time: {
    type: String,
  },
  description: {
    type: String,
    trim: true,
  },
  videoUrl: {
    type: String,
  },
});

module.exports = mongoose.model("SubSection", subSectionSchema);
