import express from "express";
import cors from "cors";

import analyzeRoutes from "./routes/analyze.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Yoru Downloader API is running",
  });
});

app.use("/api/analyze", analyzeRoutes);

export default app;