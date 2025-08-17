const express = require("express");
const router = express.Router();
const {
  summary,
  stats,
  debugDimensions,
  deleteNamespace,
} = require("../controllers/namespaceController");

router.get("/summary", summary); // /v1/summary?namespace=...
router.get("/vector-db-stats", stats);
router.get("/debug-dimensions", debugDimensions);
router.delete("/namespace/:namespace", deleteNamespace);

module.exports = router;
