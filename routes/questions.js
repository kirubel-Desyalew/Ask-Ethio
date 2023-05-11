const express = require("express");
const router = express.Router();
const passport = require("passport");
const mongoose = require("mongoose");

const { v4: uuidv4 } = require("uuid");
const path = require("path");
const Question = require("../models/question");
const Answer = require("../models/answer");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/answers");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  try {
    const questions = await Question.find().populate("answers");
    res.render("questions", { questions });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate("answers");
    const user = req.user;
    if (
      user &&
      !user.likedQuestions &&
      !user.reportedQuestions &&
      !user.likedAnswers &&
      !user.reportedAnswers
    ) {
      user.likedQuestions = [];
      user.reportedQuestions = [];
      user.likedAnswers = [];
      user.reportedAnswers = [];
    }
    res.render("specificquestions", { question: question, user });
  } catch {
    res.redirect("/questions");
  }
});

router.post("/:id/answers", upload.single("image"), async (req, res) => {
  if (!req.isAuthenticated()) {
    res.redirect("/sign-in");
    return;
  }

  const questionId = req.params.id;

  try {
    const question = await Question.findById(questionId);
    console.log(req.file);
    if (!question) {
      console.log("no question");
      res.status(404).send("Question not found");
      return;
    }
    const path = req.file ? "/images/answers/" + req.file.filename : "";
    console.log(path);
    const answer = new Answer({
      description: req.body.description,
      author: req.user.id,
      question: questionId,
      image: path,
    });

    await answer.save();

    question.answers.push(answer);
    await question.save();

    res.redirect("/questions/" + questionId);
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
