// server.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import SearchAPI from "@hammerhead/searchapi"; // updated SearchAPI

// Setup __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize SearchAPI
const se = SearchAPI({
  delay: 500,
  safeSearch: true,
  resultsPerPage: 10,
  cacheSize: 200,
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve static files

// Serve homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Search route
app.get("/search/:query", async (req, res) => {
  const query = decodeURIComponent(req.params.query);
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;

  try {
    // Fetch enough results for current page
    const {
      text: allText,
      instant: instantResults,
      wiki: wikiResults,
    } = await se.search(query, page * perPage);

    // Slice for current page
    const paginatedText = allText.slice((page - 1) * perPage, page * perPage);

    res.json({
      text: paginatedText,
      instant: instantResults,
      wiki: wikiResults,
      hasNext: allText.length > page * perPage,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
