const express = require("express");
const router = express.Router();
const {
  addVideoTranscript,
  searchAI,
  searchTranscripts,
} = require("../controllers/legacySearchController");

router.post("/add-video-transcript", addVideoTranscript);
router.get("/search-ai", searchAI);
router.get("/search-transcripts", searchTranscripts);

module.exports = router;
