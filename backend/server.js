const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());

app.get("/api/youtube-videos", async (req, res) => {
  const { videoUrl } = req.query;

  try {
    // If a video URL or ID is provided
    if (videoUrl) {
      // Extract video ID from full URL or ID string
      const videoIdMatch = videoUrl.match(
        /(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      const videoId = videoIdMatch ? videoIdMatch[1] : videoUrl;

      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/videos",
        {
          params: {
            part: "snippet,statistics",
            id: videoId,
            key: process.env.YOUTUBE_API_KEY,
          },
        }
      );

      return res.json(response.data);
    }

    // Otherwise, return most popular videos
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet",
          chart: "mostPopular",
          regionCode: "US",
          maxResults: 10,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
