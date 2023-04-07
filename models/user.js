const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require("mongoose-findorcreate");

const userSchema = new mongoose.Schema({
  username: { type: String },
  email: { type: String },
  password: { type: String },
  avatar: { type: String },
  createdAt: { type: Date, default: Date.now },
  googleId: { type: String },
});

userSchema.plugin(passportLocalMongoose, { usernameUnique: false });
userSchema.plugin(findOrCreate);

const User = mongoose.model("User", userSchema);
module.exports = User;
