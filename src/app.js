const express = require("express")
const cors = require("cors")

const errorMiddleware = require("./middlewares/error.middleware")
const authRoutes = require("./routes/auth.routes")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))



app.use("/api/auth", authRoutes)

app.use(errorMiddleware)

module.exports = app