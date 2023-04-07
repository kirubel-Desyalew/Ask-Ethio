const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("askquestion");
  } else {
    res.redirect("/sign-in");
  }
});

module.exports = router;
