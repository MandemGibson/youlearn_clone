const axios = require("axios");
const vectorService = require("../services/vectorService");

async function processYouTube(req, res) {
  const { source_url, namespace } = req.body;
  if (!source_url || !namespace)
    return res
      .status(400)
      .json({ error: "source_url and namespace are required" });
  try {
    const videoId = vectorService.extractVideoId(source_url);
    let videoData = null;
    try {
      const videoResponse = await axios.get(
        "https://www.googleapis.com/youtube/v3/videos",
        {
          params: {
            part: "snippet,statistics",
            id: videoId,
            key: process.env.YOUTUBE_API_KEY,
          },
        }
      );
      if (videoResponse.data.items?.length)
        videoData = videoResponse.data.items[0];
    } catch (e) {
      console.warn("YouTube metadata fetch failed", e.message);
    }
    const result = await vectorService.addYouTubeTranscript(
      videoId,
      namespace,
      videoData
    );
    res.json({
      success: true,
      videoId,
      namespace,
      title: videoData?.snippet?.title || `YouTube Video ${videoId}`,
      chunksAdded: result.chunks.length,
      existing: result.existing,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function search(req, res) {
  const { limit = 10 } = req.query;
  const { query, namespace } = req.body;
  if (!query)
    return res.status(400).json({ error: "Query parameter is required" });
  try {
    const results = await vectorService.search(
      query,
      parseInt(limit),
      namespace
    );
    const aiResponse = await vectorService.generateAIResponse(
      query,
      results,
      namespace
    );
    res.json({
      ...aiResponse,
      searchResults: results.map((r) => ({
        id: r.id,
        content: r.content,
        similarity: r.similarity,
        type: r.type,
        namespace: r.namespace,
        videoId: r.videoId,
        filename: r.filename,
        title: r.title,
        channelTitle: r.channelTitle,
        chunkIndex: r.chunkIndex,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { processYouTube, search };
