const vectorService = require("../services/vectorService");

async function buildContext(
  namespace,
  topicQuery = "core concepts",
  topK = 25
) {
  try {
    const searchResults = await vectorService
      .search(topicQuery, topK, namespace)
      .catch(() => []);
    return searchResults
      .slice(0, 15)
      .map((r, i) => `[Chunk ${i + 1}]\n${r.content}`)
      .join("\n\n");
  } catch {
    return "";
  }
}

async function generateJSONResponse(systemPrompt, userPrompt, fallbackKey) {
  try {
    const response = await vectorService.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1800,
    });
    const raw = response.choices[0].message.content.trim();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    try {
      return JSON.parse(cleaned);
    } catch {
      return { [fallbackKey]: [], raw };
    }
  } catch (e) {
    return { error: e.message, [fallbackKey]: [] };
  }
}

async function flashcards(req, res) {
  const { namespace, count = 15 } = req.body || {};
  if (!namespace) return res.status(400).json({ error: "namespace required" });
  try {
    const context = await buildContext(namespace, "important concepts", 30);
    const systemPrompt =
      "You generate high-quality study flashcards from provided academic content.";
    const userPrompt = `Content Chunks:\n${context}\n\nGenerate ${count} flashcards as JSON array: [{"question":"...","answer":"..."}]. ONLY JSON.`;
    const data = await generateJSONResponse(
      systemPrompt,
      userPrompt,
      "flashcards"
    );
    const flashcards = Array.isArray(data)
      ? data
      : data.flashcards || data.cards || [];
    res.json({
      namespace,
      count: flashcards.length,
      flashcards,
      raw: data.raw,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function quiz(req, res) {
  const { namespace, count = 10, difficulty = "mixed" } = req.body || {};
  if (!namespace) return res.status(400).json({ error: "namespace required" });
  try {
    const context = await buildContext(
      namespace,
      "key facts and definitions",
      30
    );
    const systemPrompt =
      "You create multiple choice quizzes from educational content.";
    const userPrompt = `Content Chunks:\n${context}\n\nCreate a JSON array of ${count} questions: [{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"...","difficulty":"easy|medium|hard","category":"topic"}]. Difficulty focus: ${difficulty}. ONLY JSON.`;
    const data = await generateJSONResponse(systemPrompt, userPrompt, "quiz");
    const quiz = Array.isArray(data) ? data : data.quiz || data.questions || [];
    res.json({ namespace, count: quiz.length, quiz, raw: data.raw });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function summary(req, res) {
  const { namespace, type = "brief" } = req.body || {};
  if (!namespace) return res.status(400).json({ error: "namespace required" });
  const styleMap = {
    brief: "Concise overview focusing on key points and conclusions.",
    detailed:
      "Comprehensive analysis including executive summary, key points, topics, conclusions, action items.",
    executive: "Strategic executive summary with insights and recommendations.",
  };
  try {
    const context = await buildContext(namespace, "overall themes", 35);
    const systemPrompt =
      "You produce structured summaries of academic / technical content.";
    const userPrompt = `Content Chunks:\n${context}\n\nGenerate a ${type} summary (${styleMap[type]}) as JSON: {"executiveSummary":"","keyPoints":[],"mainTopics":[],"conclusions":[],"actionItems":[],"wordCount":0,"readingTime":0}. ONLY JSON.`;
    const data = await generateJSONResponse(
      systemPrompt,
      userPrompt,
      "summary"
    );
    const summary = data.summary || data || {};
    res.json({ namespace, type, summary, raw: data.raw });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function chapters(req, res) {
  const { namespace, maxChapters = 8 } = req.body || {};
  if (!namespace) return res.status(400).json({ error: "namespace required" });
  try {
    const context = await buildContext(namespace, "topics and sections", 40);
    const systemPrompt =
      "You decompose content into logical chapters / sections.";
    const userPrompt = `Content Chunks:\n${context}\n\nProduce JSON: {"chapters":[{"id":1,"title":"","summary":"","content":"","keyPoints":[],"wordCount":0,"readingTime":0,"subsections":[{"title":"","summary":""}]}],"totalChapters":N,"documentStructure":"","navigationTips":[]}. Use <= ${maxChapters} chapters. ONLY JSON.`;
    const data = await generateJSONResponse(
      systemPrompt,
      userPrompt,
      "chapters"
    );
    const chapters =
      data.chapters || (data.structure && data.structure.chapters) || [];
    res.json({
      namespace,
      total: chapters.length,
      chapters,
      meta: {
        documentStructure: data.documentStructure,
        navigationTips: data.navigationTips,
      },
      raw: data.raw,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function notes(req, res) {
  const { namespace } = req.body || {};
  if (!namespace) return res.status(400).json({ error: "namespace required" });
  try {
    const context = await buildContext(namespace, "important insights", 35);
    const systemPrompt = "You extract structured study notes from content.";
    const userPrompt = `Content Chunks:\n${context}\n\nCreate JSON: {"notes":[{"id":"note_1","title":"","content":"","excerpt":"","color":"#hex","tags":[],"isPinned":false,"isBookmarked":false,"createdAt":"ISO","updatedAt":"ISO","type":"highlight|summary|question|manual|todo","priority":"low|medium|high"}],"totalNotes":N,"categories":[],"autoSummary":""}. ONLY JSON.`;
    const data = await generateJSONResponse(systemPrompt, userPrompt, "notes");
    const notes = data.notes || [];
    res.json({
      namespace,
      total: notes.length,
      notes,
      categories: data.categories || [],
      autoSummary: data.autoSummary || "",
      raw: data.raw,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { flashcards, quiz, summary, chapters, notes };
