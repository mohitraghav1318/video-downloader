import { useState } from "react";
import {
  ArrowDownToLine,
  Link2,
  LoaderCircle,
  Music2,
  Play,
  Sparkles,
} from "lucide-react";

import "./styles/app.scss";


const API_URL = import.meta.env.VITE_API_URL;

function App() {

  const [url, setUrl] = useState("");
  const [video, setVideo] = useState(null);
  const [selectedQuality, setSelectedQuality] = useState(null);
  const [mode, setMode] = useState("video");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const analyzeVideo = async () => {
  if (!url.trim()) {
    setError("Paste a video URL first.");
    return;
  }

  try {
    setLoading(true);
    setError("");
    setVideo(null);
    setSelectedQuality(null);

    const response = await fetch(`${API_URL}/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });

    const text = await response.text();

    if (!text) {
      throw new Error(
        `Server returned an empty response (${response.status})`
      );
    }

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      console.error("Non-JSON server response:", text);

      throw new Error(
        `Server returned invalid JSON (${response.status})`
      );
    }

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || `Request failed (${response.status})`
      );
    }

    setVideo(result.data);
    setSelectedQuality(
      result.data.qualities?.[0]?.height ?? null
    );
  } catch (err) {
    console.error("Analyze error:", err);

    setError(
      err.message || "Something went wrong."
    );
  } finally {
    setLoading(false);
  }
};

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  };

  const downloadMedia = async () => {
  if (!video) return;

  try {
    setDownloading(true);
    setError("");

    const endpoint =
      mode === "video"
        ? "/api/download/video"
        : "/api/download/audio";

    const body =
      mode === "video"
        ? {
            url: video.webpageUrl,
            height: selectedQuality,
          }
        : {
            url: video.webpageUrl,
            bitrate: 192,
          };

    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const text = await response.text();

      throw new Error(
        text || "Download failed."
      );
    }

    const blob = await response.blob();

    const objectUrl =
      window.URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = objectUrl;

    const extension =
      mode === "audio"
        ? "mp3"
        : selectedQuality > 1080
          ? "webm"
          : "mp4";

    anchor.download =
      `${video.title}.${extension}`;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    window.URL.revokeObjectURL(objectUrl);
  } catch (err) {
    console.error("Download error:", err);

    setError(
      err.message || "Download failed."
    );
  } finally {
    setDownloading(false);
  }
};

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <nav className="navbar">
        <a className="brand" href="/">
          <span className="brand-mark">
            <ArrowDownToLine size={18} />
          </span>
          <span>Yoru</span>
        </a>

        <span className="nav-status">
          <span className="status-dot" />
          Downloader online
        </span>
      </nav>

      <section className="hero">
        <div className="eyebrow">
          <Sparkles size={14} />
          High quality. Zero nonsense.
        </div>

        <h1>
          Download media
          <span> without the ugly.</span>
        </h1>

        <p>
          Paste a video link. Pick the quality. Keep the good stuff.
        </p>

        <div className="search-panel">
          <div className="url-input">
            <Link2 size={20} />

            <input
              type="url"
              placeholder="Paste a video URL..."
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") analyzeVideo();
              }}
            />

            <button onClick={analyzeVideo} disabled={loading}>
              {loading ? (
                <>
                  <LoaderCircle className="spin" size={18} />
                  Analyzing
                </>
              ) : (
                "Analyze"
              )}
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
        </div>
      </section>

      {video && (
        <section className="result-card">
          <div className="preview-wrap">
  <iframe
    src={`https://www.youtube.com/embed/${video.id}`}
    title={video.title}
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowFullScreen
  />
</div>

          <div className="video-content">
            <div className="video-heading">
              <div>
                <span className="channel">{video.channel}</span>
                <h2>{video.title}</h2>
              </div>

              <span className="quality-count">
                {video.qualities.length} qualities
              </span>
            </div>

            <div className="mode-switch">
              <button
                className={mode === "video" ? "active" : ""}
                onClick={() => setMode("video")}
              >
                <Play size={16} />
                Video
              </button>

              <button
                className={mode === "audio" ? "active" : ""}
                onClick={() => setMode("audio")}
              >
                <Music2 size={16} />
                MP3
              </button>
            </div>

            {mode === "video" ? (
              <div className="quality-grid">
                {video.qualities.map((quality) => (
                  <button
                    key={quality.height}
                    className={
                      selectedQuality === quality.height ? "selected" : ""
                    }
                    onClick={() => setSelectedQuality(quality.height)}
                  >
                    <strong>{quality.label}</strong>
                    <span>
                      {quality.fps} FPS
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="quality-grid">
                {video.audio.formats.map((format) => (
                  <button key={format.bitrate}>
                    <strong>{format.bitrate}</strong>
                    <span>kbps MP3</span>
                  </button>
                ))}
              </div>
            )}

            <button
  className="download-button"
  onClick={downloadMedia}
  disabled={downloading}
>
  {downloading ? (
    <>
      <LoaderCircle
        className="spin"
        size={19}
      />
      Preparing download...
    </>
  ) : (
    <>
      <ArrowDownToLine size={19} />
      Download {mode === "video" ? "Video" : "MP3"}
    </>
  )}
</button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;