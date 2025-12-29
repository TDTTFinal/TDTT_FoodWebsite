// backend/routes/searchRoutes.js
const express = require("express");
const axios = require("axios");
const mongoose = require("mongoose");

const Restaurant = require("../models/Restaurant");

const router = express.Router();

const HF_SEARCH_URL =
  process.env.HF_SEARCH_URL || "https://nemo-chewz.hf.space/api/v1/search/";

// GET /api/search/advanced
router.get("/advanced", async (req, res) => {
  try {
    const { q, top_k, lat, lon, radius, alpha, min_score } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({ message: "Thiếu từ khóa q" });
    }

    const DEFAULT_LAT = 10.7769;
    const DEFAULT_LON = 106.7009;
    const DEFAULT_RADIUS = 20000; 
    const DEFAULT_ALPHA = 0.6;
    const DEFAULT_TOP_K = 9999;
    const DEFAULT_MIN_SCORE = 0.35;

    const alphaValue = parseFloat(alpha) || DEFAULT_ALPHA;
    const minScore = parseFloat(min_score) || DEFAULT_MIN_SCORE;
    const queryLower = q.trim().toLowerCase();

    let results = [];
    let hfDataLength = 0;
    let usedFallback = false;

    // Try HuggingFace API first
    try {
      const hfParams = {
        q: q.trim(),
        top_k: top_k || DEFAULT_TOP_K,
        lat: lat || DEFAULT_LAT,
        lon: lon || DEFAULT_LON,
        radius: radius || DEFAULT_RADIUS,
        alpha: alphaValue,
      };

      const startTime = Date.now();
      const hfResponse = await axios.get(HF_SEARCH_URL, {
        params: hfParams,
        timeout: 15000, 
      });
      const duration = Date.now() - startTime;
      console.log(`✅ HuggingFace API responded in ${duration}ms with ${hfResponse.data.length} results.`);

      results = hfResponse.data;
      hfDataLength = results.length;

      // ENRICHMENT from MongoDB
      if (Array.isArray(results) && results.length > 0) {
        // Create sets of IDs from HF results
        const ids = results
          .map((r) => r.restaurant_id || r._id || r.id)
          .filter((id) => mongoose.isValidObjectId(id)); 
        
        const dbRestaurants = await Restaurant.find({ _id: { $in: ids } }).lean();
        const dbMap = new Map(dbRestaurants.map((r) => [r._id.toString(), r]));

        results = results
          .map((item) => {
            const id = item.restaurant_id || item._id || item.id;
            const dbItem = dbMap.get(id.toString());
            
            if (!dbItem) return null; 

            const semanticScore = item.semantic_score || 0;
            const tfidfScore = item.tfidf_score || 0;
            const hybridScore =
              alphaValue * semanticScore + (1 - alphaValue) * tfidfScore;

            const hasKeywordMatch =
              dbItem.name.toLowerCase().includes(queryLower) ||
              dbItem.menu?.some((m) => m.name.toLowerCase().includes(queryLower));

            return {
              ...item,
              ...dbItem,
              _id: dbItem._id,
              hybrid_score: hybridScore,
              has_keyword_match: hasKeywordMatch,
            };
          })
          .filter((item) => {
            if (!item) return false;
            return (
              item.hybrid_score >= minScore ||
              (item.has_keyword_match && item.hybrid_score >= 0.2)
            );
          });
      }
    } catch (hfError) {
      console.error(`⚠️ HuggingFace API failed: ${hfError.message}`);
      usedFallback = true;
    }

    // FALLBACK: If HF fails or returns 0 results, use MongoDB regex search
    if (results.length === 0) {
      console.log("📍 Using MongoDB fallback search for:", q);
      usedFallback = true;
      
      const fallbackResults = await Restaurant.find({
        $or: [
          { name: { $regex: q, $options: "i" } },
          { address: { $regex: q, $options: "i" } },
          { "menu.name": { $regex: q, $options: "i" } }
        ]
      })
      .sort({ avg_rating: -1 })
      .limit(30)
      .lean();

      results = fallbackResults.map(r => ({
          ...r,
          hybrid_score: 0.5,
          has_keyword_match: true,
          semantic_score: 0,
          tfidf_score: 0,
          is_fallback: true
      }));
    }

    console.log(
      `Search "${q}": ${usedFallback ? 'Fallback' : 'HF'} → ${results.length} results`
    );

    return res.json({
      success: true,
      total: results.length,
      data: results,
      metadata: {
        query: q.trim(),
        min_score_applied: minScore,
        alpha_applied: alphaValue,
        original_total: hfDataLength,
        filtered_total: results.length,
        used_fallback: usedFallback
      },
    });
  } catch (error) {
    console.error("Advanced search error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi tìm kiếm",
      error: error.message
    });
  }
});

module.exports = router;
