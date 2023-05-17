require("dotenv").config();
const express = require("express");
const passport = require("passport");

const { v4: uuidv4 } = require("uuid");
const path = require("path");
const { google } = require("googleapis");
const sightengine = require("sightengine");
const axios = require("axios");
const router = express.Router();
const Question = require("../models/question");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/questions");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("askquestion", { error: null });
  } else {
    res.redirect("/sign-in");
  }
});

// Save question
// Set up post route

const FormData = require("form-data");
const fs = require("fs");
const sightengineUser = process.env.SIGHTENGINE_API_USER;
const sightengineSecret = process.env.SIGHTENGINE_API_SECRET;

router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, tags, description } = req.body;
    const author = req.user.id;
    const path = req.file ? "/images/questions/" + req.file.filename : "";
    const question = new Question({
      title,
      tags,
      description,
      image: path,
      author,
    });

    // Use Google Perspective API to detect inappropriate content in the text
    const textToAnalyze = `${title} ${description} ${tags}`;
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
      console.log("Bad question detected");
      return res.render("askquestion", {
        title: "Ask a question",
        error:
          "Your question appears to contain inappropriate content. Please try again with a different question.",
      });
    }

    // Use Sightengine API to detect inappropriate content in the image
    if (req.file) {
      const data = new FormData();
      data.append("media", fs.createReadStream(req.file.path));
      data.append(
        "models",
        "nudity-2.0,wad,offensive,text-content,gore,tobacco,gambling"
      );
      console.log(data);
      console.log(sightengineUser);
      console.log(sightengineSecret);
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
        return res.render("askquestion", {
          title: "Ask a question",
          error:
            "Your question image appears to contain inappropriate content. Please try again with a different image.",
        });
      }
    }

    question.save();
    res.redirect("/questions");
  } catch (err) {
    console.error(err);
    res.render("askquestion", {
      title: "Ask a question",
      error: "An error occurred while posting your question. Please try again.",
    });
  }
});

module.exports = router;
