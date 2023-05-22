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
    const questions = await Question.find()
      .sort({ createdAt: -1 }) // Sort by createdAt field in descending order (latest first)
      .populate("answers");
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
    const error = req.query.error;

    // Update the error messages based on the error query parameter
    let errorMessage = "";
    if (error === "image") {
      errorMessage =
        "Your answer contains inappropriate image content. Please try again with a different answer.";
    } else if (error === "text") {
      errorMessage =
        "Your answer contains inappropriate text content. Please try again with a different answer.";
    } else if (error === "badanswer") {
      errorMessage =
        "Your answer appears to contain inappropriate content. Please try again with a different answer.";
    }
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
    res.render("specificquestions", { question: question, user, errorMessage });
  } catch {
    res.redirect("/questions");
  }
});
const FormData = require("form-data");
const fs = require("fs");
const axios = require("axios");
const sightengineUser = process.env.SIGHTENGINE_API_USER;
const sightengineSecret = process.env.SIGHTENGINE_API_SECRET;

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

    // Use Google Perspective API to detect inappropriate content in the text
    const textToAnalyze = req.body.description;
    const options = {
      comment: { text: textToAnalyze },
      languages: ["en"],
      requestedAttributes: {
        TOXICITY: {},
        INSULT: {},
        THREAT: {},
        SEXUALLY_EXPLICIT: {},
        FLIRTATION: {},
      },
    };
    const perspectiveUrl = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${process.env.GOOGLE_PERSPECTIVE_API_KEY}`;
    const perspectiveResponse = await axios.post(
      perspectiveUrl,
      JSON.stringify(options),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    const perspectiveAttributes = perspectiveResponse.data.attributeScores;
    // Check if either API detects inappropriate content
    if (
      Object.keys(perspectiveAttributes).some(
        (key) => perspectiveAttributes[key].summaryScore.value > 0.5
      )
    ) {
      console.log("Bad answer detected");
      return res.redirect(`/questions/${questionId}?error=text`);
    }

    // Use Sightengine API to detect inappropriate content in the image
    if (req.file) {
      const data = new FormData();
      data.append("media", fs.createReadStream(req.file.path));
      data.append(
        "models",
        "nudity-2.0,wad,offensive,text-content,gore,tobacco,gambling"
      );
      data.append("api_user", sightengineUser);
      data.append("api_secret", sightengineSecret);
      const sightengineResponse = await axios({
        method: "post",
        url: "https://api.sightengine.com/1.0/check.json",
        data: data,
        headers: data.getHeaders(),
      });
      const sightengineModels = sightengineResponse.data;
      const badModels = Object.keys(sightengineModels).filter(
        (key) => sightengineModels[key].prob > 0.5
      );
      if (badModels.length > 0) {
        console.log("Bad image detected");
        return res.redirect(`/questions/${questionId}?error=image`);
      }
    }

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
