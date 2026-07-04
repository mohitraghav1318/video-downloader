import { analyzeVideo } from "../services/ytdlp.service.js";

export const analyze = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Video URL is required",
      });
    }

    const video = await analyzeVideo(url);

    return res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    console.error("Analyze error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to analyze video",
    });
  }
};