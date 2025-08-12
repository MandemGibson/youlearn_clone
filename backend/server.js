const express = require("express");
const { Pinecone } = require("@pinecone-database/pinecone");
const OpenAI = require("openai");
const axios = require("axios");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs").promises;
const { spawn } = require("child_process");
const path = require("path");
const multer = require("multer");
const pdfParse = require("pdf-parse");
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Educational keywords and channels (keep your existing arrays)
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

class PythonTranscriptExtractor {
  async getTranscript(videoId) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, "get_transcript.py");

      fs.access(scriptPath)
        .then(() => {
          console.log(`🐍 Running Python transcript extraction for ${videoId}`);

          const python = spawn("python", [scriptPath, videoId]);
          let output = "";
          let errorOutput = "";

          python.stdout.on("data", (data) => {
            output += data.toString();
          });

          python.stderr.on("data", (data) => {
            errorOutput += data.toString();
          });

          python.on("close", (code) => {
            if (code !== 0) {
              reject(
                new Error(
                  `Python script failed with code ${code}: ${errorOutput}`
                )
              );
              return;
            }

            try {
              const result = JSON.parse(output);
              if (result) {
                console.log(
                  `✅ Successfully extracted ${result.length} transcript segments`
                );
                resolve(result);
              } else {
                reject(
                  new Error(result.error || "Unknown Python script error")
                );
              }
            } catch (parseError) {
              reject(
                new Error(
                  `Failed to parse Python output: ${parseError.message}\nOutput: ${output}`
                )
              );
            }
          });

          python.on("error", (error) => {
            reject(
              new Error(`Failed to start Python process: ${error.message}`)
            );
          });
        })
        .catch(() => {
          reject(
            new Error(
              "get_transcript.py not found. Please create the Python script first."
            )
          );
        });
    });
  }
}

// ===== ENHANCED PINECONE VECTOR DATABASE WITH NAMESPACE SUPPORT =====
class PineconeYouTubeVectorDB {
  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.indexName = process.env.PINECONE_INDEX_NAME || "youtube-transcripts";
    this.index = null;
    this.transcriptExtractor = new PythonTranscriptExtractor();
  }

  async initialize() {
    try {
      this.index = this.pinecone.Index(this.indexName);
      console.log(`✅ Connected to Pinecone index: ${this.indexName}`);
    } catch (error) {
      console.error("❌ Failed to initialize Pinecone:", error.message);
      throw error;
    }
  }

  // Add debugging method for dimension issues
  async debugDimensions() {
    try {
      console.log("🔍 Debugging dimension mismatch...");

      const indexStats = await this.index.describeIndexStats();
      console.log(`📊 Index dimension: ${indexStats.dimension}`);

      const testEmbedding = await this.createEmbedding("test");
      console.log(`🧠 Embedding dimension: ${testEmbedding.length}`);

      if (indexStats.dimension === testEmbedding.length) {
        console.log("✅ Dimensions match!");
        return true;
      } else {
        console.log("❌ Dimension mismatch detected!");
        console.log(`   Index expects: ${indexStats.dimension}`);
        console.log(`   Embedding produces: ${testEmbedding.length}`);
        return false;
      }
    } catch (error) {
      console.error("❌ Debug error:", error.message);
      throw error;
    }
  }

  async createEmbedding(text) {
    try {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      console.error("❌ Error creating embedding:", error.message);
      throw error;
    }
  }

  extractVideoId(url) {
    const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : url;
  }

  // Enhanced method with namespace support
  async addContentToNamespace(namespace, content, metadata = {}) {
    try {
      console.log(`📁 Processing content for namespace: ${namespace}`);

      // Check if content already exists in this namespace
      const existingCheck = await this.index.fetch([`${namespace}_0`]);
      if (
        existingCheck.records &&
        Object.keys(existingCheck.records).length > 0
      ) {
        console.log(`📁 Content already exists in namespace: ${namespace}`);
        return { existing: true, chunks: [] };
      }

      if (!content || content.trim().length < 50) {
        throw new Error(`Content too short: ${content.length} characters`);
      }

      console.log(`📝 Processing content: ${content.length} characters`);

      // Split into chunks
      const chunks = this.chunkText(content, 500);

      if (chunks.length === 0) {
        throw new Error("No valid chunks created from content");
      }

      const vectors = [];
      const addedChunks = [];

      // Create embeddings for each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(
          `🔄 Creating embedding for chunk ${i + 1}/${chunks.length}`
        );

        const embedding = await this.createEmbedding(chunk);
        const vectorId = `${namespace}_${i}`;

        const vectorMetadata = {
          namespace: namespace,
          content: chunk,
          chunkIndex: i,
          addedAt: new Date().toISOString(),
          ...metadata,
        };

        vectors.push({
          id: vectorId,
          values: embedding,
          metadata: vectorMetadata,
        });

        addedChunks.push({
          id: vectorId,
          content: chunk,
          chunkIndex: i,
          ...vectorMetadata,
        });

        // Add small delay to avoid rate limits
        if (i < chunks.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      // Upsert vectors to Pinecone in batches
      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        await this.index.upsert(batch);
        console.log(
          `📤 Uploaded batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            vectors.length / batchSize
          )} for namespace ${namespace}`
        );
      }

      console.log(`✅ Added ${chunks.length} chunks to namespace ${namespace}`);
      return { existing: false, chunks: addedChunks };
    } catch (error) {
      console.error(
        `❌ Error processing namespace ${namespace}:`,
        error.message
      );
      throw error;
    }
  }

  async addYouTubeTranscript(videoId, namespace = null, videoData = null) {
    try {
      const actualNamespace = namespace || videoId;

      // Use Python to extract transcript
      const transcript = await this.transcriptExtractor.getTranscript(videoId);

      if (!transcript || transcript.length === 0) {
        throw new Error("No transcript segments returned from Python script");
      }

      // Convert transcript segments to full text
      const fullText = transcript.map((item) => item.text).join(" ");

      const metadata = {
        type: "youtube",
        videoId: videoId,
        title: videoData?.snippet?.title || `YouTube Video ${videoId}`,
        channelTitle: videoData?.snippet?.channelTitle || "Unknown Channel",
        publishedAt:
          videoData?.snippet?.publishedAt || new Date().toISOString(),
        viewCount: parseInt(videoData?.statistics?.viewCount || 0),
        transcriptSegments: JSON.stringify(transcript),
      };

      return await this.addContentToNamespace(
        actualNamespace,
        fullText,
        metadata
      );
    } catch (error) {
      console.error(`❌ Error processing video ${videoId}:`, error.message);
      throw error;
    }
  }

  async addPDFContent(pdfText, namespace, filename) {
    try {
      const metadata = {
        type: "pdf",
        filename: filename,
        uploadedAt: new Date().toISOString(),
      };

      return await this.addContentToNamespace(namespace, pdfText, metadata);
    } catch (error) {
      console.error(`❌ Error processing PDF ${filename}:`, error.message);
      throw error;
    }
  }

  async search(query, topK = 10, namespace = null) {
    try {
      // Create embedding for the query
      const queryEmbedding = await this.createEmbedding(query);

      // Build filter for namespace if specified
      const filter = namespace ? { namespace: { $eq: namespace } } : {};

      // Search in Pinecone
      const searchResults = await this.index.query({
        vector: queryEmbedding,
        topK: topK,
        includeMetadata: true,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      });

      // Format results
      const results = searchResults.matches.map((match) => ({
        id: match.id,
        content: match.metadata.content,
        similarity: match.score,
        namespace: match.metadata.namespace,
        type: match.metadata.type,
        videoId: match.metadata.videoId,
        filename: match.metadata.filename,
        title: match.metadata.title,
        channelTitle: match.metadata.channelTitle,
        chunkIndex: match.metadata.chunkIndex,
        publishedAt: match.metadata.publishedAt,
        viewCount: match.metadata.viewCount,
        transcriptSegments: match.metadata.transcriptSegments
          ? JSON.parse(match.metadata.transcriptSegments)
          : [],
      }));

      return results;
    } catch (error) {
      console.error("❌ Search error:", error.message);
      throw error;
    }
  }

  async generateAIResponse(query, searchResults, namespace = null) {
    try {
      // Prepare context from search results
      const context = searchResults
        .slice(0, 5)
        .map((result, index) => {
          const source =
            result.type === "youtube"
              ? result.title || `YouTube Video ${result.videoId}`
              : result.filename || "Document";
          return `[Chunk ${index + 1} - ${source}]\n${result.content}`;
        })
        .join("\n\n");

      const systemPrompt = namespace
        ? `You are an AI assistant helping users understand their uploaded content. Answer the user's question based on the content excerpts provided. Be specific and cite relevant parts when possible.`
        : `You are an AI assistant that helps users find information across multiple documents and videos. Answer the user's question based on the content excerpts provided. When referencing information, mention which source it came from.`;

      const userPrompt = `Question: ${query}

Relevant content excerpts:
${context}

Please provide a comprehensive answer based on the content above. If the information isn't sufficient to fully answer the question, say so clearly.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      });

      return {
        query,
        aiResponse: response.choices[0].message.content,
        confidence: searchResults.length > 0 ? searchResults[0].similarity : 0,
        sourcesUsed: searchResults.length,
        namespace: namespace,
        sources: searchResults.map((result) => ({
          type: result.type,
          videoId: result.videoId,
          filename: result.filename,
          title: result.title,
          similarity: result.similarity,
          excerpt: result.content.substring(0, 200) + "...",
        })),
      };
    } catch (error) {
      console.error("❌ AI response error:", error.message);
      throw error;
    }
  }

  chunkText(text, chunkSize = 500) {
    const sentences = text.split(/[.!?]+/);
    const chunks = [];
    let currentChunk = "";

    sentences.forEach((sentence) => {
      const trimmedSentence = sentence.trim();
      if (trimmedSentence.length === 0) return;

      if (currentChunk.length + trimmedSentence.length < chunkSize) {
        currentChunk += trimmedSentence + ". ";
      } else {
        if (currentChunk.trim()) chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence + ". ";
      }
    });

    if (currentChunk.trim()) chunks.push(currentChunk.trim());
    return chunks.filter((chunk) => chunk.length > 30);
  }

  async getStats() {
    try {
      const stats = await this.index.describeIndexStats();
      return {
        totalVectors: stats.totalVectorCount,
        dimension: stats.dimension,
        indexFullness: stats.indexFullness,
        namespaces: stats.namespaces,
      };
    } catch (error) {
      console.error("❌ Stats error:", error.message);
      return { error: error.message };
    }
  }

  async deleteNamespace(namespace) {
    try {
      // Get all vectors for this namespace
      const searchResults = await this.search("", 1000, namespace);
      const vectorIds = searchResults.map((result) => result.id);

      if (vectorIds.length > 0) {
        await this.index.deleteMany(vectorIds);
        console.log(
          `🗑️ Deleted ${vectorIds.length} vectors for namespace ${namespace}`
        );
      }

      return { deleted: vectorIds.length };
    } catch (error) {
      console.error("❌ Delete error:", error.message);
      throw error;
    }
  }
}

// Initialize vector database
const vectorDB = new PineconeYouTubeVectorDB();
vectorDB.initialize();

// ===== NEW API ENDPOINTS FOR YOUR FRONTEND =====

// Process YouTube link (matches your frontend expectation)
app.post("/v1/process/link", async (req, res) => {
  const { source_url, namespace } = req.body;

  try {
    if (!source_url || !namespace) {
      return res.status(400).json({
        error: "source_url and namespace are required",
      });
    }

    const videoId = vectorDB.extractVideoId(source_url);
    if (!videoId) {
      return res.status(400).json({ error: "Invalid YouTube URL or video ID" });
    }

    // Get video details from YouTube API
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

      if (videoResponse.data.items && videoResponse.data.items.length > 0) {
        videoData = videoResponse.data.items[0];
      }
    } catch (apiError) {
      console.warn(
        "YouTube API error, proceeding without video metadata:",
        apiError.message
      );
    }

    const result = await vectorDB.addYouTubeTranscript(
      videoId,
      namespace,
      videoData
    );

    res.json({
      success: true,
      videoId: videoId,
      namespace: namespace,
      title: videoData?.snippet?.title || `YouTube Video ${videoId}`,
      chunksAdded: result.chunks.length,
      existing: result.existing,
      message: result.existing
        ? "Content already exists in database"
        : "Successfully processed YouTube video",
    });
  } catch (error) {
    console.error("Process link error:", error);
    res.status(500).json({
      error: error.message,
      details:
        error.message.includes("transcript") || error.message.includes("Python")
          ? "Transcript extraction failed - video may not have transcripts available"
          : "Server error",
    });
  }
});

// Process document upload (matches your frontend expectation)
app.post("/v1/process/doc", upload.single("file"), async (req, res) => {
  const { namespace } = req.query;
  const file = req.file;

  try {
    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    if (!namespace) {
      return res.status(400).json({ error: "Namespace is required" });
    }

    if (file.mimetype !== "application/pdf") {
      // Clean up uploaded file
      await fs.unlink(file.path).catch(() => {});
      return res.status(400).json({ error: "Only PDF files are supported" });
    }

    console.log(`📄 Processing PDF: ${file.originalname}`);

    // Read and parse PDF
    const pdfBuffer = await fs.readFile(file.path);
    const pdfData = await pdfParse(pdfBuffer);

    // Clean up uploaded file
    await fs.unlink(file.path).catch(() => {});

    if (!pdfData.text || pdfData.text.trim().length < 50) {
      return res
        .status(400)
        .json({ error: "PDF appears to be empty or unreadable" });
    }

    const result = await vectorDB.addPDFContent(
      pdfData.text,
      namespace,
      file.originalname
    );

    res.json({
      success: true,
      filename: file.originalname,
      namespace: namespace,
      chunksAdded: result.chunks.length,
      existing: result.existing,
      pages: pdfData.numpages,
      textLength: pdfData.text.length,
      message: result.existing
        ? "Document already exists in database"
        : "Successfully processed PDF document",
    });
  } catch (error) {
    // Clean up file on error
    if (file && file.path) {
      await fs.unlink(file.path).catch(() => {});
    }

    console.error("Process document error:", error);
    res.status(500).json({
      error: error.message,
      details: "Document processing failed",
    });
  }
});

// Search within namespace
app.post("/v1/search", async (req, res) => {
  const { limit = 10 } = req.query;
  const { query, namespace } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const searchResults = await vectorDB.search(
      query,
      parseInt(limit),
      namespace
    );

    const aiResponse = await vectorDB.generateAIResponse(
      query,
      searchResults,
      namespace
    );

    res.json({
      ...aiResponse,
      searchResults: searchResults.map((result) => ({
        id: result.id,
        content: result.content,
        similarity: result.similarity,
        type: result.type,
        namespace: result.namespace,
        videoId: result.videoId,
        filename: result.filename,
        title: result.title,
        channelTitle: result.channelTitle,
        chunkIndex: result.chunkIndex,
      })),
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get content summary for namespace
app.get("/v1/summary", async (req, res) => {
  const { namespace, query = "summarize this content" } = req.query;

  if (!namespace) {
    return res.status(400).json({ error: "Namespace is required" });
  }

  try {
    const searchResults = await vectorDB.search(query, 10, namespace);
    const summary = await vectorDB.generateAIResponse(
      query,
      searchResults,
      namespace
    );
    res.json(summary);
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete namespace
app.delete("/v1/namespace/:namespace", async (req, res) => {
  const { namespace } = req.params;

  try {
    const result = await vectorDB.deleteNamespace(namespace);
    res.json({
      success: true,
      namespace,
      vectorsDeleted: result.deleted,
      message: `Successfully deleted ${result.deleted} vectors for namespace ${namespace}`,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: error.message });
  }
});

// ===== EXISTING API ENDPOINTS (MAINTAINED FOR BACKWARD COMPATIBILITY) =====

// Original add video transcript endpoint
app.post("/api/add-video-transcript", async (req, res) => {
  const { videoId, videoUrl } = req.body;

  try {
    const id = videoId || vectorDB.extractVideoId(videoUrl);
    if (!id) {
      return res.status(400).json({ error: "Invalid video ID or URL" });
    }

    // Get video details from YouTube API
    const videoResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/videos",
      {
        params: {
          part: "snippet,statistics",
          id: id,
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    if (!videoResponse.data.items || videoResponse.data.items.length === 0) {
      return res.status(404).json({ error: "Video not found" });
    }

    const videoData = videoResponse.data.items[0];
    const result = await vectorDB.addYouTubeTranscript(id, null, videoData);

    res.json({
      success: true,
      videoId: id,
      title: videoData.snippet.title,
      chunksAdded: result.chunks.length,
      existing: result.existing,
      message: result.existing
        ? `Video "${videoData.snippet.title}" already in database`
        : `Successfully added transcript for "${videoData.snippet.title}"`,
    });
  } catch (error) {
    console.error("Add transcript error:", error);
    res.status(500).json({
      error: error.message,
      details:
        error.message.includes("transcript") || error.message.includes("Python")
          ? "Transcript extraction failed - video may not have transcripts available or Python script issue"
          : "Server error",
    });
  }
});

// Debug endpoint for dimension issues
app.get("/api/debug-dimensions", async (req, res) => {
  try {
    const dimensionsMatch = await vectorDB.debugDimensions();
    const stats = await vectorDB.getStats();

    res.json({
      dimensionsMatch,
      indexStats: stats,
      recommendation: dimensionsMatch
        ? "✅ Dimensions are compatible"
        : "❌ Dimensions mismatch - recreate index or adjust embedding model",
    });
  } catch (error) {
    console.error("Debug error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Keep all your existing endpoints...
app.get("/api/search-ai", async (req, res) => {
  const { query, limit = 10, videoId } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const searchResults = await vectorDB.search(
      query,
      parseInt(limit),
      videoId
    );
    const aiResponse = await vectorDB.generateAIResponse(
      query,
      searchResults,
      videoId
    );

    res.json({
      ...aiResponse,
      searchResults: searchResults.map((result) => ({
        videoId: result.videoId,
        title: result.title,
        channelTitle: result.channelTitle,
        similarity: result.similarity,
        content: result.content,
        chunkIndex: result.chunkIndex,
        transcriptSegments: result.transcriptSegments,
      })),
    });
  } catch (error) {
    console.error("AI search error:", error);
    res.status(500).json({ error: error.message });
  }
});

// [Include all your other existing endpoints here...]
app.get("/api/search-transcripts", async (req, res) => {
  const { query, limit = 10, videoId } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const results = await vectorDB.search(query, parseInt(limit), videoId);

    // Group results by video
    const groupedResults = results.reduce((acc, result) => {
      if (!acc[result.videoId]) {
        acc[result.videoId] = {
          videoId: result.videoId,
          title: result.title,
          channelTitle: result.channelTitle,
          publishedAt: result.publishedAt,
          viewCount: result.viewCount,
          matches: [],
        };
      }

      acc[result.videoId].matches.push({
        content: result.content,
        similarity: result.similarity,
        chunkIndex: result.chunkIndex,
        transcriptSegments: result.transcriptSegments,
      });

      return acc;
    }, {});

    res.json({
      query,
      totalResults: results.length,
      videoCount: Object.keys(groupedResults).length,
      results: Object.values(groupedResults),
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/vector-db-stats", async (req, res) => {
  try {
    const stats = await vectorDB.getStats();
    res.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/educational-channels", async (req, res) => {
  try {
    const channelVideos = [];

    for (const channelId of EDUCATIONAL_CHANNELS.slice(0, 5)) {
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

// [Add all your other helper functions and existing endpoints...]

function buildEducationalQuery(subject, level) {
  let query = "";

  if (subject) {
    query += `${subject} `;
  }

  if (level) {
    query += `${level} `;
  }

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

      const hasEducationalKeywords = EDUCATIONAL_KEYWORDS.some(
        (keyword) =>
          title.includes(keyword) ||
          description.includes(keyword) ||
          channelTitle.includes(keyword)
      );

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

      const duration = video.contentDetails?.duration;
      const isReasonableLength =
        !duration || !duration.includes("PT") || parseDuration(duration) > 120;

      return (
        hasEducationalKeywords &&
        !hasNonEducationalContent &&
        isReasonableLength
      );
    })
    .sort((a, b) => {
      const aViews = parseInt(a.statistics?.viewCount || 0);
      const bViews = parseInt(b.statistics?.viewCount || 0);
      return bViews - aViews;
    })
    .slice(0, 10);
}

function parseDuration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}

app.get("/api/youtube-videos-with-subtitles", async (req, res) => {
  const { subject, level, language = "en", maxResults = 20 } = req.query;

  try {
    const searchQuery = buildEducationalQuery(subject, level);

    const searchResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: searchQuery,
          type: "video",
          order: "relevance",
          maxResults: parseInt(maxResults) * 2,
          videoDuration: "medium",
          videoDefinition: "any",
          regionCode: "US",
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    const videoIds = searchResponse.data.items
      .map((item) => item.id.videoId)
      .join(",");

    if (!videoIds) {
      return res.json({
        kind: "youtube#searchListResponse",
        items: [],
        message: "No videos found",
      });
    }

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

    const videosWithCaptions = [];

    for (const video of videosResponse.data.items) {
      try {
        const captionsResponse = await axios.get(
          "https://www.googleapis.com/youtube/v3/captions",
          {
            params: {
              part: "snippet",
              videoId: video.id,
              key: process.env.YOUTUBE_API_KEY,
            },
          }
        );

        const availableCaptions = captionsResponse.data.items.filter(
          (caption) => {
            const lang = caption.snippet.language;
            return (
              language === "any" ||
              lang === language ||
              lang.startsWith(language)
            );
          }
        );

        if (availableCaptions.length > 0) {
          video.captions = {
            available: true,
            languages: captionsResponse.data.items.map((caption) => ({
              language: caption.snippet.language,
              name: caption.snippet.name,
              trackKind: caption.snippet.trackKind,
              isAutoGenerated: caption.snippet.trackKind === "asr",
            })),
          };

          videosWithCaptions.push(video);
        }

        if (videosWithCaptions.length >= parseInt(maxResults)) {
          break;
        }
      } catch (captionError) {
        console.error(
          `Error checking captions for video ${video.id}:`,
          captionError.message
        );
      }
    }

    const educationalVideos = filterEducationalContent(videosWithCaptions);

    res.json({
      kind: "youtube#searchListResponse",
      items: educationalVideos.slice(0, parseInt(maxResults)),
      totalResults: educationalVideos.length,
      query: {
        subject,
        level,
        language,
        maxResults,
      },
    });
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
  console.log("🐍 Python transcript extraction ready");
  console.log("📊 Vector database ready");
  console.log("🔄 Namespace support enabled");
  console.log("📄 PDF processing enabled");
});
