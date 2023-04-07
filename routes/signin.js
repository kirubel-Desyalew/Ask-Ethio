// Import the necessary modules and models
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const router = express.Router();
const User = require("../models/user");

// Render the login form
router.get("/", (req, res) => {
  res.render("signin");
});

// Handle the login form submission
router.get("/google", passport.authenticate("google", { scope: ["profile"] }));

router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/sign-in" }),
  function (req, res) {
    // Successful authentication, redirect to secrets page.
    res.redirect("/askquestion");
  }
);

router.post("/", (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/sign-in");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/askquestion");
      });
    }
  });
});

module.exports = router;
