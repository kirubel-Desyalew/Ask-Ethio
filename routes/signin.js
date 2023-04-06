// Import the necessary modules and models
const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Render the login form
router.get("/", (req, res) => {
  res.render("signin");
});

// Handle the login form submission
router.post("/", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email, password: password })
    .exec()
    .then((user) => {
      if (!user) {
        return res.status(401).json({ message: "Authentication failed" });
      }
      res.render("askquestion");
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ error: err });
    });
});

module.exports = router;
