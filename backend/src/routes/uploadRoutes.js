const express = require("express");
const router = express.Router();
const { upload, processDocument } = require("../controllers/uploadController");

router.post("/process/doc", upload.single("file"), processDocument);

module.exports = router;
