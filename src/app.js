const express = require("express");

const errorMiddleware = require("./middlewares/error.middleware");
const articleRoutes = require("./routes/article.routes");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/article", articleRoutes);

app.use(errorMiddleware);

module.exports = app;
