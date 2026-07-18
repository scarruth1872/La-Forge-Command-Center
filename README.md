# Starfleet Operations Bridge Dashboard

An immersive, full-stack operational metrics control panel designed in the classic style of an LCARS terminal (Library Computer Access and Retrieval System). This application integrates real-time telemetry simulation, interactive subsystem dependency matrices, node topology maps, engineering diagnostics, and an AI-powered vocal command core with a speech-coupled interface.

---

## 🚀 Key Features & Capabilities

1. **Bridge Operations Dashboard**
   - **System Resilience Index (SRI)**: A dynamic live calculation of total system health based on ongoing telemetry, latency spikes, and system faults.
   - **Warp Core Stability Monitor**: Real-time alert system indicating "All Decks Clear" or flashing critical "Unstable Resonance" warnings.
   - **Stardate & UTC Clock**: Real-time accurate time syncing.

2. **Interactive Node Topology & Dependencies**
   - **Subsystem Topology**: Visual representation of ship nodes (Command, Propulsion, Sensors, Navigation, Life Support, Weapons).
   - **Service Dependency Graphs**: Matrix showcasing latency vectors, package transmission health, and failover status.

3. **Engineering Bay Diagnostics & Controls**
   - **Telemetry Simulator**: Constant background telemetry feed simulating network metrics, query analysis, and anomalies.
   - **Core Frequency Modulators**: Trigger manual failovers on active subsystems (re-routing 100% of EPS packet flow to secondary lines).

4. **Starfleet Computer Voice Link (Voice Coupling)**
   - **Vocal Wake Word Detection**: Hands-free voice recognition listening for `"Computer"` or `"La Forge"` wake phrases using the Web Speech API (`SpeechRecognition`).
   - **Majel-Like Speech Synthesis**: Measured, calm vocalization of Gemini replies utilizing custom synthesis, including pronunciation mapping for Starfleet terms (e.g., U.S.S., E.P.S., millisecond expansions).
   - **Voice Selection & Modulation**: Adjust speech rate, frequency pitch, and select specific system voice synthesizers directly from the tactical dashboard.
   - **LCARS Audio Synthesizer**: Low-level audio waveform generation (Wake chime, acknowledgment chirp, error warning, status sweep) built purely with the HTML5 Web Audio API (`AudioContext`).

5. **AI-Powered Command Core (Gemini API Integration)**
   - Proxy-based server-side Gemini integration querying the `@google/genai` library to interpret complex command queries (e.g., *"Isolate Node Bravo-7"* or *"Computer, display current latency for subsystem Delta-Rho"*).
   - Returns structured JSON payloads containing text responses, anomaly categorization, and programmatic actions (e.g., highlighting targets, triggering node failovers).

---

## 📁 Project Structure

```text
├── .env.example             # Template for required server-side credentials
├── package.json             # App scripts and core dependencies
├── server.ts                # Full-stack Express server and Vite middleware router
├── tsconfig.json            # TypeScript build configuration
├── vite.config.ts           # Vite Bundler with Tailwind support
├── metadata.json            # AI Studio app permissions (microphone permission)
└── src/
    ├── main.tsx             # React SPA entry point
    ├── App.tsx              # Main interface, voice controllers, and state panel
    ├── index.css            # Tailwind directive styles and custom CRT overlays
    ├── types.ts             # Core interface typings and metrics schemas
    ├── telemetrySimulator.ts # Real-time simulation and anomaly log generators
    └── components/
        ├── TopologyMap.tsx          # Node coordinate layouts
        ├── DependencyGraph.tsx      # Dependency linkages and health matrix
        ├── EngineeringDiagnostics.tsx # Real-time logs and self-healing overrides
        └── PrognosticatorView.tsx    # Predictive analysis and forecast chart views
```

---

## 🛠️ Reproducibility & Setup Instructions

To run this application locally or deploy it to production, follow the steps below.

### 1. Prerequisites
- **Node.js**: `v18.x` or higher (recommended `v20+`)
- **npm**: `v9.x` or higher
- **Gemini API Key**: Obtain a key from [Google AI Studio](https://aistudio.google.com/)

### 2. Install Dependencies
Clone the repository and install the standard dependencies:
```bash
npm install
```

### 3. Configure Environment Variables
Copy the configuration template to `.env` and fill in your details:
```bash
cp .env.example .env
```
Open the `.env` file and set your credentials:
```env
# Server-side environment variables (kept hidden from client)
GEMINI_API_KEY="AIzaSyYourActualAPIKeyHere"
APP_URL="http://localhost:3000"
```

### 4. Run the Development Server
Launch the full-stack development environment:
```bash
npm run dev
```
The server will start on port **3000** at `http://localhost:3000`. 
*Note: Any requests made to `/api/*` are handled by Express, while all static assets and React UI routes are served dynamically via the integrated Vite middleware.*

### 5. Build for Production
To bundle and optimize the application for containerized deployment (e.g., Cloud Run):
```bash
npm run build
```
This script performs two processes:
1. Compiles the front-end production assets into static files inside `/dist`.
2. Bundles the backend `server.ts` into a fast, compiled CommonJS bundle at `/dist/server.cjs` via `esbuild` for rapid filesystem startup.

### 6. Start the Production Build
Run the production server on your target host:
```bash
npm run start
```

---

## 🔌 Technical Architecture Details

### Server-Side API Proxies
To enforce security best practices, the `GEMINI_API_KEY` is **never** exposed to the client browser. Instead, all prompts are routed to the Express `/api/computer-query` endpoint, which interacts with the `@google/genai` client library:
```typescript
import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
```

### Web Audio Synth Frequency Frequencies
All LCARS terminal sounds are synthesized in real-time, avoiding external static audio file assets.
- **Wake Tone (Dual Oscillator)**: Combining `520Hz` and `660Hz` with exponential volume decay.
- **Acknowledgment Chirp**: Frequency sweep sweeping from `880Hz` to `1100Hz` over 120 milliseconds.
- **Warning Alarm (Dual Low Frequencies)**: Dual detuned low oscillators (`180Hz` + `185Hz`) with full 450ms sustain.

### Microphone Frame Permissions
The Web Speech API requires access to the microphone sensor. The metadata configurations request this natively:
```json
"requestFramePermissions": [
  "microphone"
]
```
Ensure that permissions are granted in the browser iframe (or open the application in a new dedicated tab for direct authorization).
