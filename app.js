require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");

const Question = require("./models/question");
const Answer = require("./models/answer");
const User = require("./models/user");
const signUpRoutes = require("./routes/signup");
const signInRoutes = require("./routes/signin");
const questionRoutes = require("./routes/questions");
const askQuestionRoutes = require("./routes/askquestion");
const answerRoutes = require("./routes/answer");
const indexRoutes = require("./routes/index");

const app = express();

// Set the public folder as a static folder
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to EJS
app.set("view engine", "ejs");

app.use(
  session({
    secret: "our little secrert.",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/q&aDB", { useNewUrlParser: true });

passport.use(User.createStrategy());
passport.serializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, {
      id: user.id,
      username: user.username,
      picture: user.picture,
    });
  });
});

passport.deserializeUser(function (user, cb) {
  process.nextTick(function () {
    return cb(null, user);
  });
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    function (accessToken, refreshToken, profile, cb) {
      console.log(profile);
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
app.get("/google", passport.authenticate("google", { scope: ["profile"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/sign-in" }),
  function (req, res) {
    // Successful authentication, redirect to secrets page.
    res.redirect("/askquestion");
  }
);
// Set up routes
app.use("/", indexRoutes);
app.use("/sign-up", signUpRoutes);
app.use("/sign-in", signInRoutes);
app.use("/questions", questionRoutes);
app.use("/askquestion", askQuestionRoutes);

// Start the server
app.listen(3000, function () {
  console.log("Server started on port 3000");
});
