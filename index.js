const express = require("express");

const app = express();

app.use(express.json());

const { dbConnect } = require("./config/database");
dbConnect();

require("dotenv").config();
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
