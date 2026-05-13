const mongoose = require("mongoose")

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
  },
  summary: {
    type: String,
    maxLength: 200,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },

  category: {
    type: String,
  },


  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

const articleModel = mongoose.model("Article", articleSchema)

module.exports = articleModel