const express = require("express");
const passport = require("passport");
const router = express.Router();
const Question = require("../models/question");
const Answer = require("../models/answer");
const User = require("../models/user");

// Other imports and configurations
// function isAuthenticated(req, res, next) {
//   if (req.isAuthenticated()) {
//     return next();
//   } else {
//     res.redirect("/sign-in");
//   }
//   // res
//   //   .status(401)
//   //   .json({ message: "You must be logged in to perform this action." });
// }
// POST route for liking a question
// POST route for liking a question
router.post("/:questionId/like", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      res.redirect("/sign-in");
      return;
    }
    const question = await Question.findById(req.params.questionId);

    // Check if the user has already liked the question
    if (question.likes.includes(req.user.id)) {
      // Remove the user's ID from the question's likes array
      question.likes.pull(req.user.id);
      await question.save();
      return res.json({ likes: question.likes.length, liked: false });
    }

    // Add the user's ID to the question's likes array
    question.likes.push(req.user.id);
    await question.save();

    // Return the updated question with the new like count
    res.json({ likes: question.likes.length, liked: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST route for liking an answer
router.post("/:questionId/answers/:answerId/like", async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.answerId);

    // Check if the user has already liked the answer
    if (answer.likes.includes(req.user.id)) {
      // Remove the user's ID from the answer's likes array
      answer.likes.pull(req.user.id);
      await answer.save();
      return res.json({ likes: answer.likes.length, liked: false });
    }

    // Add the user's ID to the answer's likes array
    answer.likes.push(req.user.id);
    await answer.save();

    // Return the updated answer with the new like count
    res.json({ likes: answer.likes.length, liked: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
// POST route for reporting a question
router.post("/:questionId/report", async (req, res) => {
  try {
    const question = await Question.findById(req.params.questionId);

    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Check if the user has already reported the question
    if (question.reports.includes(req.user.id)) {
      // Remove the user's ID from the question's reports array
      question.reports.pull(req.user.id);
      await question.save();
      return res.json({ reports: question.reports.length, removed: false });
    }

    // Add the user's ID to the question's reports array
    question.reports.push(req.user.id);
    await question.save();

    // Check if the question should be removed due to too many reports
    if (question.reports.length > 2) {
      await Question.deleteOne({ _id: question._id });
      return res.json({ removed: true });

      // Redirect to the questions page
    } else {
      // Return the updated question with the new report count
      res.json({ reports: question.reports.length });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST route for reporting an answer
router.post("/:questionId/answers/:answerId/report", async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.answerId);

    if (!answer) {
      return res.status(404).json({ error: "Answer not found" });
    }

    // Check if the user has already reported the answer
    if (answer.reports.includes(req.user.id)) {
      // Remove the user's ID from the answer's reports array
      answer.reports.pull(req.user.id);
      await answer.save();
      return res.json({ reports: answer.reports.length, removed: false });
    }

    // Add the user's ID to the answer's reports array
    answer.reports.push(req.user.id);
    await answer.save();

    // Check if the answer should be removed due to too many reports
    if (answer.reports.length > 2) {
      await Answer.deleteOne({ _id: answer._id });
      return res.json({ removed: true });
    } else {
      // Return the updated answer with the new report count
      res.json({ reports: answer.reports.length });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});
// Other routes and configurations

module.exports = router;
