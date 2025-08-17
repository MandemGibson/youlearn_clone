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

function buildEducationalQuery(subject, level) {
  let query = "";
  if (subject) query += subject + " ";
  if (level) query += level + " ";
  const randomKeyword =
    EDUCATIONAL_KEYWORDS[
      Math.floor(Math.random() * EDUCATIONAL_KEYWORDS.length)
    ];
  query += randomKeyword;
  query += " -music -entertainment -vlog -funny";
  return query.trim();
}

function filterEducationalContent(videos) {
  return videos
    .filter((video) => {
      const title = video.snippet.title.toLowerCase();
      const description = video.snippet.description.toLowerCase();
      const channelTitle = video.snippet.channelTitle.toLowerCase();
      const hasEducational = EDUCATIONAL_KEYWORDS.some(
        (k) =>
          title.includes(k) ||
          description.includes(k) ||
          channelTitle.includes(k)
      );
      const nonEducational = [
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
      const banned = nonEducational.some(
        (k) => title.includes(k) || description.includes(k)
      );
      const duration = video.contentDetails?.duration;
      const isReasonable =
        !duration || !duration.includes("PT") || parseDuration(duration) > 120;
      return hasEducational && !banned && isReasonable;
    })
    .sort(
      (a, b) =>
        parseInt(b.statistics?.viewCount || 0) -
        parseInt(a.statistics?.viewCount || 0)
    )
    .slice(0, 10);
}

function parseDuration(duration) {
  const match = duration?.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const h = parseInt(match[1] || 0);
  const m = parseInt(match[2] || 0);
  const s = parseInt(match[3] || 0);
  return h * 3600 + m * 60 + s;
}

module.exports = {
  EDUCATIONAL_KEYWORDS,
  EDUCATIONAL_CHANNELS,
  buildEducationalQuery,
  filterEducationalContent,
  parseDuration,
};
