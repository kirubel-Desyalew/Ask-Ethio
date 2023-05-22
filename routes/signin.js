// Import the necessary modules and models
const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const router = express.Router();
const User = require("../models/user");

// Render the login form
router.get("/", (req, res) => {
  res.render("signin", { error: null });
});

// Handle the login form submission
router.post("/", (req, res, next) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
      res.redirect("/sign-in");
    } else {
      passport.authenticate("local", function (err, user, info) {
        if (err) {
          console.log(err);
          res.redirect("/sign-in");
        } else if (!user) {
          // Add error message for failed authentication
          return res.render("signin", {
            error: "Invalid email or password. Please try again.",
          });
        } else {
          req.logIn(user, function (err) {
            if (err) {
              console.log(err);
              res.redirect("/sign-in");
            } else {
              res.redirect("/askquestion");
            }
          });
        }
      })(req, res, next); // Pass 'next' as an argument to the passport.authenticate middleware
    }
  });
});

module.exports = router;
