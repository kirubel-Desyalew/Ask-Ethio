// searchRoutes.js
const express = require("express");
const router = express.Router();
const Question = require("../models/question");

// searchRoutes.js
router.get("/search", async (req, res) => {
  try {
    const query = req.query.query;
    const questions = await Question.find({
      $or: [
        { title: new RegExp(query, "i") },
        { tags: new RegExp(query, "i") },
      ],
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching search results" });
  }
});

module.exports = router;
