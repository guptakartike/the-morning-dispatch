const express = require("express")
const cors = require("cors")
const path = require("path")

const errorMiddleware = require("./middlewares/error.middleware")
const authRoutes = require("./routes/auth.routes")
const categoryRoutes = require("./routes/category.routes")
const articleRoutes = require('./routes/article.routes')

const app = express()

app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","PATCH","DELETE"],
  allowedHeaders: ["Content-Type","Authorization"]
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Serve frontend static files
const frontendPath = path.join(__dirname, "../tmd-frontend")
app.use(express.static(frontendPath))

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/article", articleRoutes)

// Catch-all: serve frontend for any non-API route
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"))
})

app.use(errorMiddleware)

module.exports = app