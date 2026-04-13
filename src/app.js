const express = require("express")
const cors = require("cors")
const path = require("path")

const errorMiddleware = require("./middlewares/error.middleware")
const authRoutes = require("./routes/auth.routes")
const categoryRoutes = require("./routes/category.routes")
const articleRoutes = require('./routes/article.routes')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static(path.join(__dirname, "uploads")))



app.use("/api/auth", authRoutes)
app.use("/api/categories", categoryRoutes)
app.use("/api/article", articleRoutes)


app.use(errorMiddleware)

module.exports = app