const vectorService = require("../services/vectorService");

async function summary(req, res) {
  const { namespace, query = "summarize this content" } = req.query;
  if (!namespace)
    return res.status(400).json({ error: "Namespace is required" });
  try {
    const searchResults = await vectorService.search(query, 10, namespace);
    const result = await vectorService.generateAIResponse(
      query,
      searchResults,
      namespace
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function stats(req, res) {
  try {
    const s = await vectorService.getStats();
    res.json(s);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function debugDimensions(req, res) {
  try {
    const d = await vectorService.debugDimensions();
    res.json(d);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

async function deleteNamespace(req, res) {
  const { namespace } = req.params;
  if (!namespace) return res.status(400).json({ error: "Namespace required" });
  try {
    const r = await vectorService.deleteNamespace(namespace);
    res.json({ success: true, namespace, vectorsDeleted: r.deleted });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

module.exports = { summary, stats, debugDimensions, deleteNamespace };
