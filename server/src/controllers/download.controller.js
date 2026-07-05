import {
  downloadAudio,
  downloadVideo,
} from "../services/ytdlp.service.js";

const ALLOWED_BITRATES = [128, 192, 320];

export const downloadMp3 = async (req, res) => {
  try {
    const { url, bitrate = 192 } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Video URL is required",
      });
    }

    const parsedBitrate = Number(bitrate);

    if (!ALLOWED_BITRATES.includes(parsedBitrate)) {
      return res.status(400).json({
        success: false,
        message: "Bitrate must be 128, 192, or 320",
      });
    }

    await downloadAudio(url, parsedBitrate);

    return res.status(200).json({
      success: true,
      message: `MP3 downloaded at ${parsedBitrate} kbps`,
    });
  } catch (error) {
    console.error("MP3 download error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to download MP3",
    });
  }
};


const ALLOWED_HEIGHTS = [144, 240, 360, 480, 720, 1080, 1440, 2160];

export const downloadMp4 = async (req, res) => {
  try {
    const { url, height = 1080 } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Video URL is required",
      });
    }

    const parsedHeight = Number(height);

    if (!ALLOWED_HEIGHTS.includes(parsedHeight)) {
      return res.status(400).json({
        success: false,
        message: "Invalid video quality",
      });
    }

    await downloadVideo(url, parsedHeight);

    return res.status(200).json({
      success: true,
      message: `Video downloaded at up to ${parsedHeight}p`,
    });
  } catch (error) {
    console.error("MP4 download error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to download video",
    });
  }
};