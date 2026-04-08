const express = require("express")
const router = express.Router()

const authMiddleware = require("../middlewares/auth.middleware")

const {
  registerUser,
  loginUser,
  getUser,
} = require("../controllers/auth.controller")
 
router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/me", authMiddleware, getUser)

module.exports = router