const express = require("express");
const router = express.Router();
const { processYouTube, search } = require("../controllers/contentController");

router.post("/process/link", processYouTube);
router.post("/search", search);

module.exports = router;
