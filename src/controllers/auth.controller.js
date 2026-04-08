const userModel = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

async function registerUser(req, res, next) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      })
    }

    const existingUser = await userModel.findOne({ email })

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      })
    }

    const hash = await bcrypt.hash(password, 10)

    const user = await userModel.create({
      name,
      email,
      password: hash,
    })

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    next(err)
  }
}

async function loginUser(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      })
    }

    const user = await userModel.findOne({ email })

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      })
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (err) {
    next(err)
  }
}

async function getUser(req, res, next) {
  try {
    const userId = req.user.id

    const user = await userModel.findById(userId).select("-password")

    res.json({
      success: true,
      user,
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  registerUser,
  loginUser,
  getUser,
}