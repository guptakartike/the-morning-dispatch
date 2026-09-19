const app = require("./src/app")
const connectDB = require("./src/db/db")
const { startScheduler, runIngestionJob } = require("./src/jobs/scheduler");
require("dotenv").config()

const startServer = async () => {
  try {
    await connectDB();

    app.listen(process.env.PORT, () => {
      console.log("TMD Server running");
    });

    startScheduler();

    await runIngestionJob();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();