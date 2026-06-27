import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client lazy-style
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return aiClient;
}

// Full-stack metrics database API
app.post("/api/computer-query", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      const prompt = `You are the Starfleet Computer Core running on the USS Enterprise main computer banks.
Your sub-processors are configured with the professional, engineering-focused, and highly proactive personality of Lieutenant Commander Geordi La Forge.
Analyze the user's technical query or command. Your objective is to return a conversational, authentic Starfleet diagnostic response and identify if they are trying to perform a system action.

Supported actions (only choose one if they explicitly request or mention it, otherwise return "NONE"):
1. "HIGHLIGHT_SUBSYSTEM" - e.g. "display current latency for Delta-Rho", "show telemetry for Delta-Rho", "highlight Alpha-Prime".
   Target can be: "Delta-Rho", "Alpha-Prime", "Beta-7", "Gamma-5", "Epsilon-9", or any subsystem they name.
2. "PREDICT_SATURATION" - e.g. "predict storage saturation", "forecast array Gamma-7 capacity", "when will storage fill up".
   Target can be: "Gamma-7", "Alpha-Storage", "Delta-Vault".
3. "TRIGGER_FAILOVER" - e.g. "warp core failover", "engage backup link", "initiate shield generator failover".
   Target can be: "Warp Core", "Shield Generator", "Primary Data Link".
4. "ISOLATE_NODE" - e.g. "isolate Node Bravo-7", "cut off Bravo-7", "contain bravo-7".
   Target can be: "Node Bravo-7", "Node Gamma-5", "Node Alpha-Prime".
5. "DEPLOY_PATCH" - e.g. "deploy environmental patch", "patch dilithium chamber firmware".
   Target can be: "Dilithium Chamber", "Life Support".
6. "STATUS_REPORT" - e.g. "system-wide report", "diagnostic scan", "La Forge report".
   Target can be: "General".

User query: "${query}"

Return a structured JSON object strictly matching this schema:
{
  "response": "Your Starfleet voice response here (e.g. 'Acknowledged, Commander. Adjusting primary arrays to highlight Delta-Rho latency...')",
  "action": "One of the action string names listed above, or 'NONE'",
  "target": "The exact name of the subsystem or node, or 'General' or 'NONE'",
  "analysis": "High-fidelity diagnostic report or predictive analysis paragraph detailing the warp core efficiency, dilithium alignment, or storage trajectory."
}`;

      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              response: { type: Type.STRING },
              action: { type: Type.STRING },
              target: { type: Type.STRING },
              analysis: { type: Type.STRING },
            },
            required: ["response", "action", "target", "analysis"],
          },
        },
      });

      const responseText = geminiResponse.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return res.json(parsed);
      }
    } catch (e: any) {
      console.error("Gemini query error, falling back to local engine:", e.message);
    }
  }

  // Local Starfleet Pattern Matcher Fallback
  const qLower = query.toLowerCase();
  let responseText = "Acknowledged, Commander. Main computer scanning operational grids... Query logged.";
  let actionText = "NONE";
  let targetText = "General";
  let analysisText = "Sector scan indicates standard warp core throughput holding steady. No primary loop anomalies detected.";

  if (qLower.includes("delta-rho") || qLower.includes("latency")) {
    responseText = "Acknowledged, Commander. Displaying real-time latency diagnostics for subsystem Delta-Rho. Average transit is holding at 42.4ms with standard deviations within Starfleet safety thresholds.";
    actionText = "HIGHLIGHT_SUBSYSTEM";
    targetText = "Delta-Rho";
    analysisText = "Subsystem Delta-Rho telemetry indicates slight packet jitter across the primary optronic coupling, but the secondary link is fully synchronized.";
  } else if (qLower.includes("bravo-7") || qLower.includes("isolate") || qLower.includes("contain")) {
    responseText = "Understood. Initiating containment field. Node Bravo-7 has been successfully isolated from the primary feed. Redundant routing is active.";
    actionText = "ISOLATE_NODE";
    targetText = "Node Bravo-7";
    analysisText = "Node Bravo-7 isolated. Redundant paths have successfully absorbed 100% of the active routing overhead with 0.00% packet loss.";
  } else if (qLower.includes("gamma-7") || qLower.includes("predict") || qLower.includes("saturation")) {
    responseText = "Scanning storage telemetry. Predictive analysis for Storage Array Gamma-7 completed. At current log accumulation rates, storage saturation will reach critical 90% threshold in 37.2 days.";
    actionText = "PREDICT_SATURATION";
    targetText = "Gamma-7";
    analysisText = "Warning: Linear buffer logs are compiling at 4.2 Terabytes per hour. Recommending diagnostic purge or log rotation before day 30.";
  } else if (qLower.includes("failover") || qLower.includes("warp")) {
    responseText = "Affirmative. Manual failover initiated for the Warp Core primary power grid. Backup dilithium regulator is now active and on-line.";
    actionText = "TRIGGER_FAILOVER";
    targetText = "Warp Core";
    analysisText = "Failover sequence complete. Dilithium resonance stabilized at 98.4% of peak output. Operational redundancy restored.";
  } else if (qLower.includes("patch") || qLower.includes("deploy") || qLower.includes("scrubber")) {
    responseText = "Processing engineering directive. Firmware patch compiled and deployed to the primary Life Support array.";
    actionText = "DEPLOY_PATCH";
    targetText = "Life Support";
    analysisText = "Firmware update loaded into main buffer. Auxiliary environmental scrubbers operating at 115% efficiency.";
  } else if (qLower.includes("status") || qLower.includes("report")) {
    responseText = "System-wide diagnostic scan complete. System Resilience Index is holding at 94.6%. Redundancy coverage is nominal.";
    actionText = "STATUS_REPORT";
    targetText = "General";
    analysisText = "All main sectors report green. Alerts de-duplicated and consolidated into sidebar log. Standard operations proceed.";
  }

  res.json({
    response: responseText,
    action: actionText,
    target: targetText,
    analysis: analysisText,
  });
});

// Configure Vite integration for SPA fallback and asset serving
async function main() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Starfleet Command server online on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start Starfleet Server:", err);
});
