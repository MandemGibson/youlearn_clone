const express = require("express");
const router = express.Router();
const {
  educationalChannels,
  youtubeVideosWithSubtitles,
} = require("../controllers/educationalController");

router.get("/educational-channels", educationalChannels);
router.get("/youtube-videos-with-subtitles", youtubeVideosWithSubtitles);

module.exports = router;
