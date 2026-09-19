const app = require("./src/app")
const connectDB = require("./src/db/db")
const { fetchAllSources } = require("./src/services/news.service");
const { startScheduler } = require("./src/jobs/scheduler");
require("dotenv").config()

const startServer = async () => {
  try {
    await connectDB();

    await fetchAllSources();

    app.listen(process.env.PORT, () => {
      console.log("TMD Server running");
      startScheduler();
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();