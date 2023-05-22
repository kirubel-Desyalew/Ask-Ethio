const express = require("express");
const router = express.Router();
const Question = require("../models/question");
const User = require("../models/user");

router.get("/", async (req, res) => {
  try {
    const questionCount = await Question.countDocuments();
    const userCount = await User.countDocuments();

    res.render("index", { questionCount, userCount });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
