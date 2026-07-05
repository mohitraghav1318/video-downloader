import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export const analyzeVideo = async (url) => {
  const { stdout } = await execFileAsync("yt-dlp", [
    "--dump-single-json",
    "--no-playlist",
    "--skip-download",
    url,
  ]);

  const data = JSON.parse(stdout);

  const rawVideoFormats = data.formats.filter((format) => {
    return (
      format.vcodec !== "none" &&
      format.height &&
      format.width
    );
  });

  const qualityMap = new Map();

  for (const format of rawVideoFormats) {
    if (!qualityMap.has(format.height)) {
      qualityMap.set(format.height, {
        label:
          format.height === 2160
            ? "4K"
            : format.height === 1440
              ? "2K"
              : `${format.height}p`,

        height: format.height,
        width: format.width,
        fps: format.fps,
      });
    }
  }

  const qualities = Array.from(qualityMap.values()).sort(
    (a, b) => b.height - a.height
  );

  return {
    id: data.id,
    title: data.title,
    thumbnail: data.thumbnail,
    duration: data.duration,
    channel: data.channel || data.uploader,
    webpageUrl: data.webpage_url,
    qualities,

    audio: {
      available: true,
      formats: [
        { label: "MP3 128 kbps", bitrate: 128 },
        { label: "MP3 192 kbps", bitrate: 192 },
        { label: "MP3 320 kbps", bitrate: 320 },
      ],
    },
  };
};

export const downloadAudio = async (url, bitrate = 192) => {
  const args = [
    "--no-playlist",
    "-x",
    "--audio-format",
    "mp3",
    "--audio-quality",
    `${bitrate}K`,
    "-o",
    "downloads/%(title)s.%(ext)s",
    url,
  ];

  const { stdout, stderr } = await execFileAsync("yt-dlp", args);

  return {
    stdout,
    stderr,
  };
};


export const downloadVideo = async (url, height = 1080) => {
  const formatSelector =
    `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/` +
    `bestvideo[height<=${height}]+bestaudio/` +
    `best[height<=${height}]`;

  const args = [
    "--no-playlist",
    "-f",
    formatSelector,
    "--merge-output-format",
    "mp4",
    "-o",
    "downloads/%(title)s.%(ext)s",
    url,
  ];

  const { stdout, stderr } = await execFileAsync("yt-dlp", args, {
    maxBuffer: 10 * 1024 * 1024,
  });

  return {
    stdout,
    stderr,
  };
};