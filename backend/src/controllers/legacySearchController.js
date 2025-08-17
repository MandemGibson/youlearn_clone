const vectorService = require("../services/vectorService");

async function addVideoTranscript(req, res) {
  const { videoId, videoUrl } = req.body;
  try {
    const id = videoId || vectorService.extractVideoId(videoUrl);
    if (!id) return res.status(400).json({ error: "Invalid video ID or URL" });
    // Fetch metadata (handled inside process link originally) omitted for brevity.
    const result = await vectorService.addYouTubeTranscript(id, null, null);
    res.json({
      success: true,
      videoId: id,
      chunksAdded: result.chunks.length,
      existing: result.existing,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function searchAI(req, res) {
  const { query, limit = 10, videoId } = req.query;
  if (!query)
    return res.status(400).json({ error: "Query parameter is required" });
  try {
    const searchResults = await vectorService.search(
      query,
      parseInt(limit),
      videoId
    );
    const aiResponse = await vectorService.generateAIResponse(
      query,
      searchResults,
      videoId
    );
    res.json({
      ...aiResponse,
      searchResults: searchResults.map((r) => ({
        videoId: r.videoId,
        title: r.title,
        channelTitle: r.channelTitle,
        similarity: r.similarity,
        content: r.content,
        chunkIndex: r.chunkIndex,
        transcriptSegments: r.transcriptSegments,
      })),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function searchTranscripts(req, res) {
  const { query, limit = 10, videoId } = req.query;
  if (!query)
    return res.status(400).json({ error: "Query parameter is required" });
  try {
    const results = await vectorService.search(query, parseInt(limit), videoId);
    const grouped = results.reduce((acc, r) => {
      if (!acc[r.videoId])
        acc[r.videoId] = {
          videoId: r.videoId,
          title: r.title,
          channelTitle: r.channelTitle,
          publishedAt: r.publishedAt,
          viewCount: r.viewCount,
          matches: [],
        };
      acc[r.videoId].matches.push({
        content: r.content,
        similarity: r.similarity,
        chunkIndex: r.chunkIndex,
        transcriptSegments: r.transcriptSegments,
      });
      return acc;
    }, {});
    res.json({
      query,
      totalResults: results.length,
      videoCount: Object.keys(grouped).length,
      results: Object.values(grouped),
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { addVideoTranscript, searchAI, searchTranscripts };
