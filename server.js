const app = require("./src/app")
const connectDB = require("./src/db/db")
const { fetchNewsBySource } = require("./src/services/news.service");
require("dotenv").config()

const startServer = async () => {
  try {
    await connectDB();

    await fetchNewsBySource("bbc-news");

    app.listen(process.env.PORT, () => {
      console.log("TMD Server running");
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();