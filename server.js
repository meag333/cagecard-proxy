const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error("ERROR: ANTHROPIC_API_KEY environment variable is not set.");
  process.exit(1);
}

// Allow requests from any origin (lab phones, tablets, computers)
app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Health check — visiting this URL in a browser confirms the proxy is running
app.get("/", (req, res) => {
  res.json({ status: "CageCard AI proxy is running", ready: true });
});

// Proxy endpoint — receives requests from the app and forwards to Anthropic
app.post("/api/messages", async (req, res) => {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error("Proxy error:", err.message);
    res.status(500).json({ error: { type: "proxy_error", message: err.message } });
  }
});

app.listen(PORT, () => {
  console.log(`CageCard AI proxy running on port ${PORT}`);
});
