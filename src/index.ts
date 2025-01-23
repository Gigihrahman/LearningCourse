import express, { Router } from "express";
import router from "./routes/api";
import bodyParser from "body-parser";
import db from "./utils/database";

async function init() {
  try {
    const result = await db();
    console.log("database status", result);
    const app = express();

    const PORT: number = 3000;

    app.use(bodyParser.json());

    app.get("/", (req, res) => {
      res.status(200).json({ message: "Serve is running aaa", data: null });
    });
    app.use("/api", router);

    app.listen(PORT, () => {
      console.log(`your machine was running in : "http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

init();
