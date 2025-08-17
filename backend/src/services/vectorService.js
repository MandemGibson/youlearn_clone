const { Pinecone } = require('@pinecone-database/pinecone');
const OpenAI = require('openai');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

class PythonTranscriptExtractor {
  async getTranscript(videoId) {
    return new Promise((resolve, reject) => {
      const scriptPath = path.join(__dirname, '../../get_transcript.py');
      fs.access(scriptPath)
        .then(() => {
          const python = spawn('python', [scriptPath, videoId]);
          let output = '';
          let errorOutput = '';
          python.stdout.on('data', (d) => (output += d.toString()));
          python.stderr.on('data', (d) => (errorOutput += d.toString()));
          python.on('close', (code) => {
            if (code !== 0) return reject(new Error(`Python failed: ${errorOutput}`));
            try {
              const json = JSON.parse(output);
              if (!json || json.error) return reject(new Error(json?.error || 'Unknown python error'));
              resolve(json);
            } catch (e) {
              reject(new Error('Parse python output failed'));
            }
          });
          python.on('error', (e) => reject(e));
        })
        .catch(() => reject(new Error('get_transcript.py not found')));
    });
  }
}

class VectorService {
  constructor() {
    this.pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.indexName = process.env.PINECONE_INDEX_NAME || 'youtube-transcripts';
    this.index = this.pinecone.Index(this.indexName);
    this.transcriptExtractor = new PythonTranscriptExtractor();
  }

  async createEmbedding(text) {
    const resp = await this.openai.embeddings.create({ model: 'text-embedding-3-small', input: text });
    return resp.data[0].embedding;
  }

  extractVideoId(url) {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? match[1] : url;
  }

  chunkText(text, chunkSize = 500) {
    const sentences = text.split(/[.!?]+/);
    const chunks = [];
    let current = '';
    for (const raw of sentences) {
      const s = raw.trim();
      if (!s) continue;
      if (current.length + s.length < chunkSize) current += s + '. ';
      else { if (current.trim()) chunks.push(current.trim()); current = s + '. '; }
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks.filter(c => c.length > 30);
  }

  async addContentToNamespace(namespace, content, metadata = {}) {
    const existing = await this.index.fetch([`${namespace}_0`]);
    if (existing.records && Object.keys(existing.records).length > 0) {
      return { existing: true, chunks: [] };
    }
    if (!content || content.trim().length < 50) throw new Error('Content too short');
    const chunks = this.chunkText(content, 500);
    const vectors = [];
    const addedChunks = [];
    for (let i = 0; i < chunks.length; i++) {
      const embedding = await this.createEmbedding(chunks[i]);
      const id = `${namespace}_${i}`;
      const meta = { namespace, content: chunks[i], chunkIndex: i, addedAt: new Date().toISOString(), ...metadata };
      vectors.push({ id, values: embedding, metadata: meta });
      addedChunks.push({ id, content: chunks[i], chunkIndex: i, ...meta });
      if (i < chunks.length - 1) await new Promise(r => setTimeout(r, 100));
    }
    for (let i = 0; i < vectors.length; i += 100) {
      await this.index.upsert(vectors.slice(i, i + 100));
    }
    return { existing: false, chunks: addedChunks };
  }

  async addYouTubeTranscript(videoId, namespace, videoData) {
    const transcript = await this.transcriptExtractor.getTranscript(videoId);
    if (!transcript || transcript.length === 0) throw new Error('No transcript');
    const fullText = transcript.map(t => t.text).join(' ');
    const metadata = {
      type: 'youtube',
      videoId,
      title: videoData?.snippet?.title || `YouTube Video ${videoId}`,
      channelTitle: videoData?.snippet?.channelTitle || 'Unknown Channel',
      publishedAt: videoData?.snippet?.publishedAt || new Date().toISOString(),
      viewCount: parseInt(videoData?.statistics?.viewCount || 0),
      transcriptSegments: JSON.stringify(transcript),
    };
    return this.addContentToNamespace(namespace || videoId, fullText, metadata);
  }

  async addPDFContent(pdfText, namespace, filename) {
    const metadata = { type: 'pdf', filename, uploadedAt: new Date().toISOString() };
    return this.addContentToNamespace(namespace, pdfText, metadata);
  }

  async search(query, topK = 10, namespace) {
    const embedding = await this.createEmbedding(query);
    const filter = namespace ? { namespace: { $eq: namespace } } : undefined;
    const results = await this.index.query({ vector: embedding, topK, includeMetadata: true, filter });
    return results.matches.map(m => ({
      id: m.id,
      content: m.metadata.content,
      similarity: m.score,
      namespace: m.metadata.namespace,
      type: m.metadata.type,
      videoId: m.metadata.videoId,
      filename: m.metadata.filename,
      title: m.metadata.title,
      channelTitle: m.metadata.channelTitle,
      chunkIndex: m.metadata.chunkIndex,
      publishedAt: m.metadata.publishedAt,
      viewCount: m.metadata.viewCount,
      transcriptSegments: m.metadata.transcriptSegments ? JSON.parse(m.metadata.transcriptSegments) : [],
    }));
  }

  async generateAIResponse(query, searchResults, namespace) {
    const context = searchResults.slice(0,5).map((r,i)=>`[Chunk ${i+1}]\n${r.content}`).join('\n\n');
    const systemPrompt = namespace ? 'You are an AI assistant helping users understand their uploaded content.' : 'You help users find info across documents.';
    const userPrompt = `Question: ${query}\n\nRelevant content excerpts:\n${context}`;
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [ { role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt } ],
      max_tokens: 2000,
      temperature: 0.7,
    });
    return {
      query,
      aiResponse: response.choices[0].message.content,
      confidence: searchResults.length ? searchResults[0].similarity : 0,
      sourcesUsed: searchResults.length,
      namespace,
      sources: searchResults.map(r => ({ type: r.type, videoId: r.videoId, filename: r.filename, title: r.title, similarity: r.similarity, excerpt: r.content.substring(0,200)+'...' })),
    };
  }

  async getStats() {
    const stats = await this.index.describeIndexStats();
    return { totalVectors: stats.totalVectorCount, dimension: stats.dimension, indexFullness: stats.indexFullness, namespaces: stats.namespaces };
  }

  async debugDimensions() {
    const stats = await this.index.describeIndexStats();
    const testEmbedding = await this.createEmbedding('test');
    return {
      indexDimension: stats.dimension,
      embeddingDimension: testEmbedding.length,
      match: stats.dimension === testEmbedding.length,
      stats,
    };
  }

  async deleteNamespace(namespace) {
    // Strategy: search for many vectors by issuing multiple pattern queries is not supported; assume naming convention namespace_index
    // We'll attempt sequential fetch by trying indices until miss OR rely on stats namesapces count not available per-id list.
    // Simpler: since we stored vectors with id `${namespace}_i`, iterate until no fetch record.
    const toDelete = [];
    for (let i = 0; i < 5000; i++) { // safety upper bound
      const id = `${namespace}_${i}`;
      const record = await this.index.fetch([id]);
      if (!record.records || Object.keys(record.records).length === 0) {
        if (i === 0) break; // nothing found at all
        else break; // reached end of contiguous chunk set
      }
      toDelete.push(id);
      if (i > 0 && i % 200 === 0) {
        await this.index.deleteMany(toDelete.splice(0));
      }
    }
    if (toDelete.length) await this.index.deleteMany(toDelete);
    return { deleted: toDelete.length };
  }
}

module.exports = new VectorService();
