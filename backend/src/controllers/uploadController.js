const multer = require("multer");
const pdfParse = require("pdf-parse");
const fs = require("fs").promises;
const vectorService = require("../services/vectorService");

// Multer configuration (in-memory path storage to /uploads)
const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 50 * 1024 * 1024 },
});

async function processDocument(req, res) {
  const { namespace } = req.query;
  const file = req.file;
  try {
    if (!file) return res.status(400).json({ error: "No file uploaded" });
    if (!namespace)
      return res.status(400).json({ error: "Namespace is required" });
    if (file.mimetype !== "application/pdf") {
      await fs.unlink(file.path).catch(() => {});
      return res.status(400).json({ error: "Only PDF files are supported" });
    }
    const pdfBuffer = await fs.readFile(file.path);
    const pdfData = await pdfParse(pdfBuffer);
    await fs.unlink(file.path).catch(() => {});
    if (!pdfData.text || pdfData.text.trim().length < 50)
      return res.status(400).json({ error: "PDF appears empty or unreadable" });
    const result = await vectorService.addPDFContent(
      pdfData.text,
      namespace,
      file.originalname
    );
    res.json({
      success: true,
      filename: file.originalname,
      namespace,
      chunksAdded: result.chunks.length,
      existing: result.existing,
      pages: pdfData.numpages,
      textLength: pdfData.text.length,
    });
  } catch (e) {
    if (file?.path) await fs.unlink(file.path).catch(() => {});
    res.status(500).json({ error: e.message });
  }
}

module.exports = { upload, processDocument };
