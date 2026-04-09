const express = require("express")
const cors = require("cors")

const errorMiddleware = require("./middlewares/error.middleware")
const authRoutes = require("./routes/auth.routes")
const categoryRoutes = require("./routes/category.routes")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



app.use("/api/auth", authRoutes)
app.use("/api/categories", categoryRoutes)

app.use(errorMiddleware)

module.exports = app