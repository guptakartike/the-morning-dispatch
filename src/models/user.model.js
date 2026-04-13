const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "viewer",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const userModel = mongoose.model("User", userSchema)

module.exports = userModel