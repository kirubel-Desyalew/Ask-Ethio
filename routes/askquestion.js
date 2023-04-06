const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  console.log(req);
  res.render("askquestion");
});

module.exports = router;
