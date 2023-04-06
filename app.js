const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const Question = require("./models/question");
const Answer = require("./models/answer");
const signUpRoutes = require("./routes/signup");
const signInRoutes = require("./routes/signin");
const questionRoutes = require("./routes/questions");
const askQuestionRoutes = require("./routes/askquestion");
const answerRoutes = require("./routes/answer");
const indexRoutes = require("./routes/index");

const app = express();

// Set the public folder as a static folder
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/q&aDB", { useNewUrlParser: true });
// Set up routes
app.use("/", indexRoutes);
app.use("/sign-up", signUpRoutes);
app.use("/sign-in", signInRoutes);
app.use("/questions", questionRoutes);
app.use("/askquestion", askQuestionRoutes);

// Start the server
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
