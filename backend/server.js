const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors());

// Educational keywords and channels
const EDUCATIONAL_KEYWORDS = [
  "tutorial",
  "learn",
  "education",
  "course",
  "lesson",
  "how to",
  "explained",
  "guide",
  "programming",
  "science",
  "math",
  "history",
  "language learning",
  "coding",
  "academic",
  "university",
  "school",
];

const EDUCATIONAL_CHANNELS = [
  "UC_x5XG1OV2P6uZZ5FSM9Ttw", // Google Developers
  "UCsBjURrPoezykLs9EqgamOA", // Fireship
  "UCWv7vMbMWH4-V0ZXdmDpPBA", // Programming with Mosh
  "UC8butISFwT-Wl7EV0hUK0BQ", // freeCodeCamp
  "UCvjgXvBlbQiydffZU7m1_aw", // The Coding Train
  "UCfzlCWGWYyIQ0aLC5w48gBQ", // Sentdex
  "UCtYLUTtgS3k1Fg4y5tAhLbw", // Statquest
  "UC9OeZkIwhzfv-_Cb7fCikLQ", // NeetCode
  "UCeVMnSShP_Iviwkknt83cww", // CodeWithHarry
];

app.get("/api/youtube-videos", async (req, res) => {
  const { videoUrl, subject, level } = req.query;

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

    // Method 1: Search for educational content with keywords
    const searchQuery = buildEducationalQuery(subject, level);

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: searchQuery,
          type: "video",
          order: "relevance", // or 'viewCount', 'rating'
          maxResults: 20,
          videoDuration: "medium", // Filters out very short videos
          videoDefinition: "any",
          regionCode: "US",
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    // Get video details including statistics
    const videoIds = response.data.items
      .map((item) => item.id.videoId)
      .join(",");

    const videosResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet,statistics,contentDetails",
          id: videoIds,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    // Filter and sort educational content
    const educationalVideos = filterEducationalContent(
      videosResponse.data.items
    );

    res.json({
      ...videosResponse.data,
      items: educationalVideos,
    });
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.message });
  }
});

// Alternative endpoint for educational channels
app.get("/api/educational-channels", async (req, res) => {
  try {
    const channelVideos = [];

    // Get videos from educational channels
    for (const channelId of EDUCATIONAL_CHANNELS.slice(0, 5)) {
      // Limit to avoid quota issues
      try {
        const response = await axios.get(
          "https://www.googleapis.com/youtube/v3/search",
          {
            params: {
              part: "snippet",
              channelId: channelId,
              type: "video",
              order: "date",
              maxResults: 5,
              key: process.env.YOUTUBE_API_KEY,
            },
          }
        );
        channelVideos.push(...response.data.items);
      } catch (channelError) {
        console.error(
          `Error fetching from channel ${channelId}:`,
          channelError.message
        );
      }
    }

    res.json({
      kind: "youtube#searchListResponse",
      items: channelVideos,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to build educational search queries
function buildEducationalQuery(subject, level) {
  let query = "";

  if (subject) {
    query += `${subject} `;
  }

  if (level) {
    query += `${level} `;
  }

  // Add educational keywords
  const randomKeyword =
    EDUCATIONAL_KEYWORDS[
      Math.floor(Math.random() * EDUCATIONAL_KEYWORDS.length)
    ];
  query += randomKeyword;

  // Add additional filters to improve educational content
  query += " -music -entertainment -vlog -funny";

  return query.trim();
}

// Helper function to filter educational content
function filterEducationalContent(videos) {
  return videos
    .filter((video) => {
      const title = video.snippet.title.toLowerCase();
      const description = video.snippet.description.toLowerCase();
      const channelTitle = video.snippet.channelTitle.toLowerCase();

      // Check for educational keywords
      const hasEducationalKeywords = EDUCATIONAL_KEYWORDS.some(
        (keyword) =>
          title.includes(keyword) ||
          description.includes(keyword) ||
          channelTitle.includes(keyword)
      );

      // Filter out entertainment content
      const nonEducationalKeywords = [
        "music video",
        "song",
        "funny",
        "prank",
        "reaction",
        "vlog",
        "gaming",
        "entertainment",
        "comedy",
        "meme",
      ];

      const hasNonEducationalContent = nonEducationalKeywords.some(
        (keyword) => title.includes(keyword) || description.includes(keyword)
      );

      // Check video duration (educational videos are usually longer)
      const duration = video.contentDetails?.duration;
      const isReasonableLength =
        !duration || !duration.includes("PT") || parseDuration(duration) > 120; // At least 2 minutes

      return (
        hasEducationalKeywords &&
        !hasNonEducationalContent &&
        isReasonableLength
      );
    })
    .sort((a, b) => {
      // Sort by view count and like ratio
      const aViews = parseInt(a.statistics?.viewCount || 0);
      const bViews = parseInt(b.statistics?.viewCount || 0);
      return bViews - aViews;
    })
    .slice(0, 10); // Return top 10
}

// Helper function to parse YouTube duration format (PT1H2M10S)
function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}

app.listen(5000, () => console.log("Server running on port 5000"));
