const express = require("express");
const router = express.Router();
const User = require("../models/user");

// User registration
router.get("/", (req, res) => {
  res.render("signup");
});

router.post("", async (req, res) => {
  try {
    const newUser = new User({
      email: req.body.email,
      username: req.body.username,
      password: req.body.password,
    });

    // Save the new user to the database
    await newUser.save();

    // Redirect the user to the login page
    res.redirect("/sign-in");
  } catch (error) {
    console.log(error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
