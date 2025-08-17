const express = require("express");
const router = express.Router();
const {
  flashcards,
  quiz,
  summary,
  chapters,
  notes,
} = require("../controllers/studyToolsController");

router.post("/generate/flashcards", flashcards);
router.post("/generate/quiz", quiz);
router.post("/generate/summary", summary);
router.post("/generate/chapters", chapters);
router.post("/generate/notes", notes);

module.exports = router;
