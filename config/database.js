const mongoose = require("mongoose");
require("dotenv").config();

exports.dbConnect = async () => {
  await mongoose
    .connect(process.env.DATABASE_URL)
    .then(() => {
      console.log("Database connection Successfull");
    })
    .catch((error) => {
      console.log("Db connection error");
      console.error(error);
      process.exit(1);
    });
};
