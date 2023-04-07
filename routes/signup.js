const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/user");

// User registration
router.get("/", (req, res) => {
  res.render("signup");
});

router.post("/", function (req, res) {
  const password = req.body.password;
  console.log(password);
  User.register(
    { username: req.body.username },
    password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.redirect("/sign-up");
      } else {
        passport.authenticate("local")(req, res, function () {
          res.redirect("/askquestion");
        });
      }
    }
  );
});

module.exports = router;
