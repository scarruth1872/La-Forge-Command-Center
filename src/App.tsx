import React, { useState, useEffect, useRef } from "react";
import { 
  SubsystemHealth, 
  NodeHealth, 
  StorageArrayState, 
  ActionLogEntry, 
  Alert, 
  ComputerResponse 
} from "./types";
import { 
  INITIAL_SUBSYSTEMS, 
  INITIAL_NODES, 
  INITIAL_STORAGE_ARRAYS, 
  INITIAL_LOGS, 
  INITIAL_ALERTS, 
  generateForecastData, 
  tickTelemetry 
} from "./telemetrySimulator";

// Component imports
import TopologyMap from "./components/TopologyMap";
import DependencyGraph from "./components/DependencyGraph";
import EngineeringDiagnostics from "./components/EngineeringDiagnostics";
import PrognosticatorView from "./components/PrognosticatorView";

// Icons
import { 
  ShieldAlert, 
  Cpu, 
  Network, 
  Layers, 
  Sliders, 
  Calendar, 
  Activity, 
  Terminal, 
  Send, 
  Mic, 
  Wrench, 
  RefreshCw, 
  Clock, 
  Heart,
  FileText,
  Volume2,
  VolumeX
} from "lucide-react";

export default function App() {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<"T1" | "T2" | "T3" | "T4">("T1");

  // Telemetry state
  const [subsystems, setSubsystems] = useState<SubsystemHealth[]>(INITIAL_SUBSYSTEMS);
  const [nodes, setNodes] = useState<NodeHealth[]>(INITIAL_NODES);
  const [storage, setStorage] = useState<StorageArrayState[]>(INITIAL_STORAGE_ARRAYS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [logs, setLogs] = useState<ActionLogEntry[]>(INITIAL_LOGS);
  
  // What-if simulator active failures state
  const [activeFailures, setActiveFailures] = useState<Record<string, boolean>>({});
  
  // Historical playback state (in minutes, -10 to 0)
  const [playbackTime, setPlaybackTime] = useState<number>(0);
  
  // Highlight state triggered by AI console or region clicks
  const [activeHighlight, setActiveHighlight] = useState<string | null>(null);
  
  // Selected Node context from topology click, routed to Engineering Panel
  const [selectedNodeName, setSelectedNodeName] = useState<string | null>(null);

  // AI Voice/Text Terminal states
  const [inputQuery, setInputQuery] = useState<string>("");
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string>(
    "Starfleet Computer online. Welcome back, Commander La Forge. Systems currently operating on optimal auxiliary power grids."
  );
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);

  // Immersive Voice and Audio Core States
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [speakEnabled, setSpeakEnabled] = useState<boolean>(true);
  const [voiceStatus, setVoiceStatus] = useState<"IDLE" | "LISTENING_WAKE" | "LISTENING_CMD" | "TALKING" | "UNSUPPORTED">("IDLE");
  const [voicePitch, setVoicePitch] = useState<number>(1.0); // Smooth classic Star Trek pitch
  const [voiceRate, setVoiceRate] = useState<number>(0.95);  // Smooth measured cadence
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
        
        // Find a perfect default Star Trek Computer voice (Majel-like)
        const preferred = voices.find(v => 
          v.name.includes("Zira") || // Windows classic synthesized female
          v.name.includes("Samantha") || // Apple smooth Samantha
          v.name.includes("Google US English") || // Chrome smooth
          v.name.includes("Hazel") ||
          (v.lang.startsWith("en-") && v.name.toLowerCase().includes("female")) ||
          v.lang.startsWith("en-US")
        );
        if (preferred) {
          setSelectedVoiceName(preferred.name);
        } else if (voices.length > 0) {
          setSelectedVoiceName(voices[0].name);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Web Audio LCARS Sound Synthesizer
  const playLcarsBeep = (type: "WAKE" | "ACK" | "ERROR" | "CHIRP") => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      if (type === "WAKE") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc1.frequency.setValueAtTime(520, ctx.currentTime);
        osc2.frequency.setValueAtTime(660, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.35);
        osc2.stop(ctx.currentTime + 0.35);
      } else if (type === "ACK") {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1100, ctx.currentTime + 0.12);
        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === "ERROR") {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc1.frequency.setValueAtTime(180, ctx.currentTime);
        osc2.frequency.setValueAtTime(185, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.45);
        osc2.stop(ctx.currentTime + 0.45);
      } else if (type === "CHIRP") {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
      }
    } catch (e) {
      console.warn("Web Audio API not supported or user gesture needed.", e);
    }
  };

  // Text-to-Speech Vocal Response Synthesis
  const speakResponse = (text: string) => {
    if (!speakEnabled) return;
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        
        // Star Trek computers speak with calm, measured pronunciation
        const cleanText = text
          .replace(/\*\*|__|\*|_/g, "")
          .replace(/\[.*?\]/g, "")
          .replace(/NOMINAL/g, "nominal")
          .replace(/OPTIMAL/g, "optimal")
          .replace(/CRITICAL/g, "critical")
          .replace(/\bUSS\b/g, "U. S. S.")
          .replace(/\bEPS\b/g, "E. P. S.")
          .replace(/\bUTC\b/g, "U. T. C.")
          .replace(/\bLATENCY\b/g, "latency")
          .replace(/\bms\b/gi, " milliseconds");
        
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voices = window.speechSynthesis.getVoices();
        
        let chosenVoice = voices.find(v => v.name === selectedVoiceName);
        if (!chosenVoice) {
          chosenVoice = voices.find(v => 
            v.name.includes("Zira") || 
            v.name.includes("Samantha") || 
            v.name.includes("Google US English") ||
            (v.lang.startsWith("en-") && v.name.toLowerCase().includes("female"))
          );
        }
        
        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }
        
        utterance.pitch = voicePitch;
        utterance.rate = voiceRate;
        utterance.volume = 0.95;
        
        utterance.onstart = () => {
          setVoiceStatus("TALKING");
        };
        
        utterance.onend = () => {
          if (isVoiceActive) {
            setVoiceStatus("LISTENING_WAKE");
          } else {
            setVoiceStatus("IDLE");
          }
        };

        utterance.onerror = () => {
          if (isVoiceActive) {
            setVoiceStatus("LISTENING_WAKE");
          } else {
            setVoiceStatus("IDLE");
          }
        };

        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error("Speech Synthesis failed:", err);
    }
  };

  // Time state for Starfleet UTC clock
  const [currentTime, setCurrentTime] = useState<string>("");

  const forecastData = generateForecastData();

  // Load Starfleet Clock updating every second
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const utcString = d.toISOString().replace("T", " // ").substring(0, 22);
      setCurrentTime(utcString);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Live Telemetry Ticker: update metrics every 3 seconds (unless in historical playback)
  useEffect(() => {
    if (playbackTime < 0) {
      // If we are looking at history, freeze dynamic ticking to show incident snapshot
      return;
    }

    const interval = setInterval(() => {
      setSubsystems((prevSubs) => {
        setNodes((prevNodes) => {
          setStorage((prevStorage) => {
            const ticked = tickTelemetry(prevSubs, prevNodes, prevStorage, alerts, activeFailures);
            return ticked.storage;
          });
          const ticked = tickTelemetry(prevSubs, prevNodes, storage, alerts, activeFailures);
          return ticked.nodes;
        });
        const ticked = tickTelemetry(prevSubs, nodes, storage, alerts, activeFailures);
        return ticked.subsystems;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [playbackTime, activeFailures, alerts, nodes, storage]);

  // Handle Historical Playback Metrics Mapping
  useEffect(() => {
    if (playbackTime < 0) {
      // Simulate historical incident states depending on the offset slider
      // Example: 10 minutes ago, a critical shield failure occurred
      if (playbackTime <= -8) {
        setSubsystems(prev => prev.map(s => s.id === "shield-array" 
          ? { ...s, status: "CRITICAL", latency: 98.4, packetLoss: 0.22, resourceUsage: { ...s.resourceUsage, cpu: 94 } } 
          : s
        ));
        setNodes(prev => prev.map(n => n.id === "node-bravo-7" ? { ...n, status: "OFFLINE", cpu: 0 } : n));
        setStorage(prev => prev.map(st => st.id === "storage-gamma-7" ? { ...st, replicationSyncLag: 4.8 } : st));
      } else if (playbackTime <= -4) {
        // Redundant pathways began healing
        setSubsystems(prev => prev.map(s => s.id === "shield-array" 
          ? { ...s, status: "STANDBY", latency: 34.2, packetLoss: 0.04 } 
          : s
        ));
        setNodes(prev => prev.map(n => n.id === "node-utopia-backup" ? { ...n, status: "ONLINE", cpu: 75 } : n));
      } else {
        // Recovery finalized
        setSubsystems(INITIAL_SUBSYSTEMS);
        setNodes(INITIAL_NODES);
        setStorage(INITIAL_STORAGE_ARRAYS);
      }
    } else {
      // Restore dynamic states when returning to live feed
      setSubsystems(INITIAL_SUBSYSTEMS);
      setNodes(INITIAL_NODES);
      setStorage(INITIAL_STORAGE_ARRAYS);
    }
  }, [playbackTime]);

  const addLog = (message: string, severity: "INFO" | "WARNING" | "CRITICAL" | "RESOLVED") => {
    const timestamp = new Date().toTimeString().split(" ")[0];
    const newLog: ActionLogEntry = {
      id: `log-${Date.now()}`,
      timestamp,
      agent: "La Forge",
      message,
      severity
    };
    setLogs((prev) => [...prev, newLog]);
  };

  // Automated Action handlers called from UI buttons
  const handleToggleFailure = (subsystemId: string) => {
    const wasFailed = !!activeFailures[subsystemId];
    setActiveFailures((prev) => ({
      ...prev,
      [subsystemId]: !prev[subsystemId]
    }));

    const sys = subsystems.find(s => s.id === subsystemId);
    const label = sys ? sys.name : subsystemId;

    if (!wasFailed) {
      addLog(`Disrupted power conduit feeding the primary ${label} grid. Failover alert triggered!`, "CRITICAL");
      const newAlert: Alert = {
        id: `alert-${Date.now()}`,
        source: label,
        message: `Subspace connection broken across region coupling! Redundancy routing is active.`,
        severity: "CRITICAL",
        timestamp: new Date().toTimeString().split(" ")[0],
        acknowledged: false
      };
      setAlerts(prev => [newAlert, ...prev]);
    } else {
      addLog(`Re-coupled primary conduits for ${label}. Self-healing system resolved telemetry anomalies.`, "RESOLVED");
      setAlerts(prev => prev.map(a => a.source === label ? { ...a, acknowledged: true } : a));
    }
  };

  const handleIsolateNode = (nodeId: string) => {
    setNodes((prev) => 
      prev.map(node => node.id === nodeId ? { ...node, status: "OFFLINE", cpu: 0 } : node)
    );
    const node = nodes.find(n => n.id === nodeId);
    addLog(`Isolated ${node?.name || nodeId} from primary EPS distribution bus to safeguard dilithium flow matrix.`, "WARNING");
  };

  const handleDeployPatch = (subsystemName: string) => {
    addLog(`Deployed operational hot-patch to the ${subsystemName} subsystem. Recalibrating transponders.`, "RESOLVED");
  };

  const handleFailoverTrigger = (subsystemName: string) => {
    addLog(`Initiated manual failover loop on ${subsystemName}. Re-routing 100% of data packet flow to secondary EPS link.`, "INFO");
  };

  // Reusable query executor for both voice and manual keyboard submissions
  const processQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsThinking(true);
    addLog(`Command Core: "${queryText}"`, "INFO");

    try {
      const response = await fetch("/api/computer-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryText })
      });

      if (!response.ok) {
        throw new Error("Starfleet main computer offline.");
      }

      const data: ComputerResponse = await response.json();
      setAiResponse(data.response);
      setAiAnalysis(data.analysis || null);

      // Play authentic LCARS acknowledgment chirp
      playLcarsBeep("ACK");

      // Speak back the response
      speakResponse(data.response);

      // Perform real-time action based on AI interpretation
      if (data.action && data.action !== "NONE") {
        if (data.action === "HIGHLIGHT_SUBSYSTEM" && data.target) {
          setActiveHighlight(data.target);
          setTimeout(() => setActiveHighlight(null), 8000); // fade out highlight
        } else if (data.action === "ISOLATE_NODE" && data.target) {
          // Identify matching node id
          const targetNode = nodes.find(n => n.name.toLowerCase().includes(data.target.toLowerCase()) || data.target.toLowerCase().includes(n.id.replace("node-", "")));
          if (targetNode) {
            handleIsolateNode(targetNode.id);
          }
        } else if (data.action === "PREDICT_SATURATION" && data.target) {
          setActiveTab("T4"); // Navigate to prediction prognosticator tab
        } else if (data.action === "TRIGGER_FAILOVER" && data.target) {
          handleFailoverTrigger(data.target);
        } else if (data.action === "DEPLOY_PATCH" && data.target) {
          handleDeployPatch(data.target);
        } else if (data.action === "STATUS_REPORT") {
          setActiveTab("T1");
        }
      }
    } catch (err: any) {
      console.error(err);
      const fallbackText = "Main subspace antenna loop reports high interference. Please restate query directive.";
      setAiResponse(fallbackText);
      speakResponse(fallbackText);
      playLcarsBeep("ERROR");
    } finally {
      setIsThinking(false);
    }
  };

  // Submit query to server-side Gemini AI interface
  const handleQuerySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;
    const userQuery = inputQuery;
    setInputQuery("");
    await processQuery(userQuery);
  };

  // Maintain a stable ref of processQuery to execute in SpeechRecognition event listeners safely
  const processQueryRef = useRef(processQuery);
  useEffect(() => {
    processQueryRef.current = processQuery;
  });

  const recognitionRef = useRef<any>(null);

  // Speech Recognition continuous hook
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (isVoiceActive) {
        setVoiceStatus("UNSUPPORTED");
        addLog("Speech recognition not natively supported in this browser environment. Using manual simulation triggers.", "WARNING");
      }
      return;
    }

    if (isVoiceActive) {
      let rec: any;
      try {
        rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = "en-US";

        rec.onstart = () => {
          setVoiceStatus("LISTENING_WAKE");
          addLog("Microphone array activated. Awaiting vocal wake word 'Computer' or 'La Forge'...", "INFO");
          playLcarsBeep("CHIRP");
        };

        rec.onresult = (event: any) => {
          const lastResultIndex = event.results.length - 1;
          const transcript = event.results[lastResultIndex][0].transcript.trim();
          const lower = transcript.toLowerCase();
          
          console.log("Speech heard: ", transcript);

          // Check if wake-word is present
          const hasWake = lower.includes("computer") || lower.includes("la forge") || lower.includes("forge");
          if (hasWake) {
            playLcarsBeep("WAKE");
            // Find what was said after the wake word
            let command = "";
            if (lower.includes("computer")) {
              command = transcript.substring(lower.indexOf("computer") + 8).trim();
            } else if (lower.includes("la forge")) {
              command = transcript.substring(lower.indexOf("la forge") + 8).trim();
            } else if (lower.includes("forge")) {
              command = transcript.substring(lower.indexOf("forge") + 5).trim();
            }

            if (command.length > 2) {
              setVoiceStatus("LISTENING_CMD");
              addLog(`Vocal wake-word and directive recognized: "${command}"`, "INFO");
              processQueryRef.current(command);
            } else {
              setVoiceStatus("LISTENING_CMD");
              const greetings = "Computer online. State directive, Commander.";
              setAiResponse(greetings);
              speakResponse(greetings);
              addLog("Voice Interface: Wake word detected. Ready for your directive.", "INFO");
            }
          } else {
            // Conversational mode: if already waiting for command, treat entire phrase as a query
            if (voiceStatus === "LISTENING_CMD") {
              addLog(`Vocal command received: "${transcript}"`, "INFO");
              processQueryRef.current(transcript);
            }
          }
        };

        rec.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            addLog("Microphone sensor link rejected. Verify browser frame permissions are allowed.", "CRITICAL");
            setIsVoiceActive(false);
          }
        };

        rec.onend = () => {
          // Restart recognition if voice interface is still toggled active
          if (isVoiceActive) {
            try {
              rec.start();
            } catch (e) {
              // already running
            }
          }
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        console.error("Failed to start SpeechRecognition:", err);
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
      setVoiceStatus("IDLE");
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, [isVoiceActive, voiceStatus]);

  // Fast pre-packaged command macros for users
  const handlePresetCommand = (commandText: string) => {
    setInputQuery(commandText);
  };

  // Core system composite metrics
  const activeAlertsCount = alerts.filter(a => !a.acknowledged).length;
  const isWarpCoreCritical = Object.keys(activeFailures).length > 0;
  
  // Calculate a composite resilience index (SRI) score dynamically
  const sriScore = Math.max(
    40, 
    Math.round(98 - (activeAlertsCount * 6) - (Object.keys(activeFailures).length * 12))
  );

  return (
    <div className="min-h-screen bg-[#050608] text-slate-300 font-mono flex flex-col p-4 md:p-6 border-4 border-[#1a1c23] shadow-inner relative terminal-overlay select-none">
      
      {/* IMMERSIVE HEADER SECTION */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center space-x-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Command Sector</span>
            <span className="text-xl font-bold tracking-tighter text-blue-400 glow-cyan">AGENT LA FORGE // OPS-01</span>
          </div>
          <div className="h-8 w-[1px] bg-slate-800 hidden md:block" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Stardate / UTC</span>
            <span className="text-sm font-bold text-slate-300">{currentTime || "57482.4"}</span>
          </div>
        </div>

        {/* SRI GAUGE */}
        <div className={`flex items-center space-x-4 bg-black/40 px-6 py-2 rounded-full border shadow-lg transition-all ${
          sriScore > 90 
            ? "border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.15)]" 
            : sriScore > 75 
              ? "border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]" 
              : "border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
        }`}>
          <div className="flex flex-col text-right font-mono">
            <span className={`text-[10px] uppercase font-bold ${
              sriScore > 90 ? "text-green-500/80" : sriScore > 75 ? "text-amber-500/80" : "text-red-500/80"
            }`}>System Resilience Index</span>
            <span className="text-[9px] text-slate-500 uppercase">
              STABILITY: {sriScore > 90 ? "OPTIMAL" : sriScore > 75 ? "WARNING" : "CRITICAL"}
            </span>
          </div>
          <div className={`text-3xl font-black tracking-tighter italic ${
            sriScore > 90 ? "text-green-400" : sriScore > 75 ? "text-amber-400" : "text-red-400"
          }`}>
            {sriScore}<span className="text-sm">%</span>
          </div>
        </div>

        <div className="text-right flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-4">
          <div className="hidden md:block">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest">System Status</div>
          </div>
          <div className="flex items-center space-x-2">
            {isWarpCoreCritical ? (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_#ef4444]"></div>
                <span className="text-red-500 font-bold uppercase text-xs glow-red">Unstable Resonance</span>
              </>
            ) : (
              <>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                <span className="text-green-500 font-bold uppercase text-xs glow-green">All Decks Clear</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* TACTICAL COMPUTER PROMPT BAR (Gemini Interface & Voice Core) */}
      <section className="bg-enterprise-panel border border-enterprise-border rounded-lg p-4 mb-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-24 h-1 bg-lcars-cyan rounded-br" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 border-b border-enterprise-border/50 pb-2">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-lcars-cyan animate-pulse" />
            <h2 className="text-xs font-mono font-bold text-lcars-cyan uppercase tracking-wider glow-cyan">
              STARFLEET COMPUTER VOICE LINK // LA FORGE BRIDGE CORRELATION
            </h2>
          </div>
          <div className="flex items-center gap-2 text-[9px] font-mono text-slate-500 uppercase">
            <span>Voice Status:</span>
            <span className={`px-2 py-0.5 rounded font-bold border ${
              voiceStatus === "LISTENING_WAKE" 
                ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30 animate-pulse" 
                : voiceStatus === "LISTENING_CMD"
                  ? "bg-green-500/10 text-green-400 border-green-500/30 animate-pulse"
                  : voiceStatus === "TALKING"
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/30 animate-pulse"
                    : "bg-slate-900 text-slate-400 border-slate-800"
            }`}>
              {voiceStatus === "LISTENING_WAKE" && "Monitoring Wake Word"}
              {voiceStatus === "LISTENING_CMD" && "Awaiting Directive"}
              {voiceStatus === "TALKING" && "Vocalizing Response"}
              {voiceStatus === "IDLE" && "Sensors Standby"}
              {voiceStatus === "UNSUPPORTED" && "Manual Override Active"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
          
          {/* Conversational Screen Output & Dynamic Waveform */}
          <div className="lg:col-span-2 bg-[#030407] rounded-lg border border-enterprise-border/50 p-3 min-h-24 flex flex-col justify-between">
            <div className="font-mono text-xs leading-relaxed text-slate-300">
              <span className="text-lcars-cyan font-bold block mb-1 uppercase text-[10px]">COMPUTER CORE:</span>
              {isThinking ? (
                <span className="text-slate-500 animate-pulse uppercase">Querying Starfleet Main Computer databases over subcarrier bands...</span>
              ) : (
                <p className="glow-cyan">{aiResponse}</p>
              )}
            </div>
            
            <div className="mt-3 flex items-center justify-between border-t border-enterprise-border/30 pt-2">
              {/* Responsive SVG Waveform */}
              <div className="flex items-center gap-1.5 h-6">
                <span className="text-[9px] text-slate-500 uppercase font-bold tracking-tight">Audio Line:</span>
                <div className="flex items-center gap-0.5 h-full">
                  {[...Array(16)].map((_, i) => {
                    let heightClass = "h-1";
                    let animClass = "";
                    if (voiceStatus === "TALKING") {
                      animClass = "animate-bounce";
                      const heights = ["h-2", "h-4", "h-3", "h-5", "h-2", "h-4", "h-3", "h-5", "h-2", "h-4", "h-3", "h-5", "h-2", "h-4", "h-3", "h-2"];
                      heightClass = heights[i % heights.length];
                    } else if (voiceStatus === "LISTENING_CMD") {
                      animClass = "animate-pulse";
                      const heights = ["h-2", "h-3", "h-2", "h-3", "h-2", "h-3", "h-2", "h-3", "h-2", "h-3", "h-2", "h-3", "h-2", "h-3", "h-2", "h-2"];
                      heightClass = heights[i % heights.length];
                    } else if (voiceStatus === "LISTENING_WAKE") {
                      const heights = ["h-1.5", "h-2", "h-1.5", "h-2", "h-1.5", "h-2", "h-1.5", "h-2", "h-1.5", "h-2", "h-1.5", "h-2", "h-1.5", "h-2", "h-1.5", "h-1.5"];
                      heightClass = heights[i % heights.length];
                    }
                    return (
                      <div 
                        key={i} 
                        className={`w-1 rounded-full bg-lcars-cyan transition-all duration-300 ${animClass} ${heightClass}`}
                        style={{ 
                          animationDelay: `${i * 0.05}s`,
                          opacity: voiceStatus === "TALKING" ? 1 : voiceStatus === "LISTENING_CMD" ? 0.8 : voiceStatus === "LISTENING_WAKE" ? 0.4 : 0.15
                        }}
                      />
                    );
                  })}
                </div>
              </div>

              {aiAnalysis && (
                <span className="text-[9px] font-mono text-lcars-orange uppercase">
                  Anomaly Vector: {aiAnalysis}
                </span>
              )}
            </div>
          </div>

          {/* Vocal Sensor Controls & Hardware Setup */}
          <div className="bg-[#0a0c12] rounded-lg border border-enterprise-border/50 p-3 flex flex-col justify-between">
            <div>
              <span className="text-slate-500 uppercase text-[9px] font-bold block mb-2 tracking-wider">Aural Control Deck</span>
              <div className="grid grid-cols-2 gap-2 mb-2">
                
                {/* Micro Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setIsVoiceActive(!isVoiceActive);
                    playLcarsBeep("CHIRP");
                  }}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded text-[10px] uppercase font-mono border transition-all ${
                    isVoiceActive 
                      ? "bg-cyan-500/10 text-cyan-400 border-cyan-400 font-bold shadow-[0_0_8px_rgba(34,197,94,0.15)] animate-pulse" 
                      : "bg-slate-950 text-slate-400 border-enterprise-border hover:border-slate-500"
                  }`}
                >
                  <Mic className={`w-3.5 h-3.5 ${isVoiceActive ? "animate-bounce" : ""}`} />
                  {isVoiceActive ? "Mic Live" : "Mic Muted"}
                </button>

                {/* Speaker Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    setSpeakEnabled(!speakEnabled);
                    playLcarsBeep("CHIRP");
                  }}
                  className={`flex items-center justify-center gap-1.5 px-2 py-2 rounded text-[10px] uppercase font-mono border transition-all ${
                    speakEnabled 
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-400 font-bold" 
                      : "bg-slate-950 text-slate-500 border-enterprise-border"
                  }`}
                >
                  {speakEnabled ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Speech On</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                      <span>Speech Off</span>
                    </>
                  )}
                </button>
              </div>

              {/* Speech Synthesis voice selector and modulation sliders */}
              <div className="bg-slate-950/80 rounded border border-enterprise-border/30 p-2 mb-2">
                <div className="flex flex-col gap-1 text-[8px] font-mono">
                  <span className="text-slate-500 font-bold uppercase tracking-wider block mb-0.5">VOICE SYNTH SELECTION:</span>
                  <select
                    value={selectedVoiceName}
                    onChange={(e) => {
                      setSelectedVoiceName(e.target.value);
                      playLcarsBeep("CHIRP");
                    }}
                    className="w-full bg-[#030407] border border-enterprise-border/60 text-slate-300 text-[9px] font-mono px-1 py-0.5 rounded focus:border-lcars-cyan outline-none"
                  >
                    {availableVoices.filter(v => v.lang.startsWith("en")).map((v) => (
                      <option key={v.name} value={v.name} className="bg-slate-950 text-slate-300">
                        {v.name.replace("Microsoft", "MS").replace("Google", "G").substring(0, 24)}
                      </option>
                    ))}
                    {availableVoices.length === 0 && (
                      <option className="text-slate-500">System Default Voice</option>
                    )}
                  </select>

                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex justify-between text-[7px] text-slate-500 uppercase">
                        <span>PITCH:</span>
                        <span className="text-lcars-cyan font-bold">{voicePitch.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.7"
                        max="1.3"
                        step="0.05"
                        value={voicePitch}
                        onChange={(e) => setVoicePitch(parseFloat(e.target.value))}
                        className="w-full h-1 bg-[#050608] rounded-lg appearance-none cursor-pointer accent-lcars-cyan"
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex justify-between text-[7px] text-slate-500 uppercase">
                        <span>SPEED:</span>
                        <span className="text-lcars-cyan font-bold">{voiceRate.toFixed(2)}</span>
                      </div>
                      <input
                        type="range"
                        min="0.7"
                        max="1.3"
                        step="0.05"
                        value={voiceRate}
                        onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                        className="w-full h-1 bg-[#050608] rounded-lg appearance-none cursor-pointer accent-lcars-cyan"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time speech instructions and test cues */}
              <div className="text-[8.5px] leading-tight text-slate-400 uppercase font-mono">
                <p className="text-slate-500 font-bold mb-1">VOICE DIRECTIVES:</p>
                <p className="mb-1">Say <span className="text-lcars-cyan font-bold">"Computer"</span> followed immediately by your command.</p>
                <p>Example: <span className="italic text-slate-300">"Computer, status report."</span></p>
              </div>
            </div>

            {/* Simulated LCARS audio trigger keys */}
            <div className="border-t border-enterprise-border/30 pt-2 flex items-center justify-between text-[8px] font-mono text-slate-500">
              <span className="font-bold">LCARS BEEPS:</span>
              <div className="flex gap-1.5">
                <button onClick={() => playLcarsBeep("WAKE")} className="px-1.5 py-0.5 rounded bg-slate-950 border border-enterprise-border/50 text-slate-400 hover:text-slate-200 uppercase">Chime</button>
                <button onClick={() => playLcarsBeep("ACK")} className="px-1.5 py-0.5 rounded bg-slate-950 border border-enterprise-border/50 text-slate-400 hover:text-slate-200 uppercase">Chirp</button>
                <button onClick={() => playLcarsBeep("ERROR")} className="px-1.5 py-0.5 rounded bg-slate-950 border border-enterprise-border/50 text-slate-400 hover:text-slate-200 uppercase">Error</button>
              </div>
            </div>
          </div>

          {/* Form Prompter Input & Simulation Suite */}
          <div className="flex flex-col justify-between p-1">
            <div>
              <span className="text-slate-500 uppercase text-[9px] font-bold block mb-1.5 tracking-wider">Tactical Prompt Box</span>
              <form onSubmit={handleQuerySubmit} className="flex gap-1 mb-2">
                <div className="flex-1 bg-slate-950 border border-enterprise-border/80 rounded flex items-center px-2">
                  <input
                    type="text"
                    value={inputQuery}
                    onChange={(e) => setInputQuery(e.target.value)}
                    placeholder="Ask computer (e.g. Isolate Node Bravo-7)..."
                    className="flex-1 bg-transparent border-none outline-none text-xs font-mono text-slate-100 placeholder-slate-600 py-1.5"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isThinking}
                  className="bg-lcars-cyan hover:bg-cyan-600 disabled:opacity-50 text-slate-950 px-3 rounded font-bold font-mono text-xs uppercase flex items-center justify-center transition-all shadow"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

            {/* Quick Simulation Macros Board */}
            <div>
              <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 uppercase mb-1">
                <span>Vocal Simulator Presets</span>
                <span className="text-[7.5px] px-1 bg-lcars-orange/10 border border-lcars-orange/20 text-lcars-orange rounded font-normal">SIM CUES</span>
              </div>
              <div className="grid grid-cols-3 gap-1 text-[8.5px] font-mono uppercase">
                <button 
                  onClick={() => {
                    playLcarsBeep("WAKE");
                    addLog("Simulated vocal trigger: 'Computer...'", "INFO");
                    setVoiceStatus("LISTENING_CMD");
                    const responsePrompt = "Computer online. State directive, Commander.";
                    setAiResponse(responsePrompt);
                    speakResponse(responsePrompt);
                  }}
                  className="px-1 py-1 text-center rounded bg-[#10141d] border border-enterprise-border hover:border-lcars-cyan text-slate-300 transition-all text-[8px]"
                  title="Simulate Wake Word trigger"
                >
                  <span className="block text-lcars-cyan font-bold mb-0.5">1. Wake</span>
                  <span>"Computer..."</span>
                </button>
                <button 
                  onClick={() => {
                    playLcarsBeep("WAKE");
                    addLog("Simulated voice: 'Computer, isolate Node Bravo-7'", "INFO");
                    processQuery("Computer, isolate Node Bravo-7");
                  }}
                  className="px-1 py-1 text-center rounded bg-[#10141d] border border-enterprise-border hover:border-lcars-cyan text-slate-300 transition-all text-[8px]"
                  title="Simulate command: Isolate Bravo-7"
                >
                  <span className="block text-lcars-green font-bold mb-0.5">2. Isolate</span>
                  <span>"Bravo-7"</span>
                </button>
                <button 
                  onClick={() => {
                    playLcarsBeep("WAKE");
                    addLog("Simulated voice: 'Computer, predict saturation for storage array Gamma-7'", "INFO");
                    processQuery("Computer, predict saturation for storage array Gamma-7");
                  }}
                  className="px-1 py-1 text-center rounded bg-[#10141d] border border-enterprise-border hover:border-lcars-cyan text-slate-300 transition-all text-[8px]"
                  title="Simulate forecast command"
                >
                  <span className="block text-lcars-orange font-bold mb-0.5">3. Predict</span>
                  <span>"Forecast Array"</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD WORKSPACE (TABBED LAYOUT) */}
      <div className="flex-1 flex flex-col xl:flex-row gap-4">
        
        {/* LEFT BAR NAV CONTROLLER (LCARS STYLE BRACKETS) */}
        <aside className="xl:w-64 flex flex-row xl:flex-col gap-2 font-mono text-xs">
          
          {/* LCARS Visual Anchor Bracket Top */}
          <div className="hidden xl:block bg-lcars-amber h-6 rounded-t-lg p-2 font-bold text-[10px] text-slate-950 uppercase select-none leading-none">
            LCARS // SECURE
          </div>

          {/* Navigation Tab buttons */}
          <button
            onClick={() => { setActiveTab("T1"); setActiveHighlight(null); }}
            className={`flex-1 xl:flex-initial text-left px-3.5 py-3 rounded-md border transition-all uppercase flex items-center gap-2 ${
              activeTab === "T1"
                ? "bg-lcars-amber text-slate-950 border-lcars-amber font-bold shadow-md scale-[1.01]"
                : "bg-enterprise-panel border-enterprise-border hover:border-slate-500 text-slate-300"
            }`}
          >
            <Activity className="w-4 h-4 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold tracking-wider leading-none">Tier 1</span>
              <span className="text-[8px] opacity-80 mt-0.5">Galactic Overview</span>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab("T2"); setActiveHighlight(null); }}
            className={`flex-1 xl:flex-initial text-left px-3.5 py-3 rounded-md border transition-all uppercase flex items-center gap-2 ${
              activeTab === "T2"
                ? "bg-lcars-amber text-slate-950 border-lcars-amber font-bold shadow-md scale-[1.01]"
                : "bg-enterprise-panel border-enterprise-border hover:border-slate-500 text-slate-300"
            }`}
          >
            <Network className="w-4 h-4 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold tracking-wider leading-none">Tier 2</span>
              <span className="text-[8px] opacity-80 mt-0.5">Sector Scan</span>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab("T3"); setActiveHighlight(null); }}
            className={`flex-1 xl:flex-initial text-left px-3.5 py-3 rounded-md border transition-all uppercase flex items-center gap-2 ${
              activeTab === "T3"
                ? "bg-lcars-amber text-slate-950 border-lcars-amber font-bold shadow-md scale-[1.01]"
                : "bg-enterprise-panel border-enterprise-border hover:border-slate-500 text-slate-300"
            }`}
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold tracking-wider leading-none">Tier 3</span>
              <span className="text-[8px] opacity-80 mt-0.5">Engineering Bay</span>
            </div>
          </button>

          <button
            onClick={() => { setActiveTab("T4"); setActiveHighlight(null); }}
            className={`flex-1 xl:flex-initial text-left px-3.5 py-3 rounded-md border transition-all uppercase flex items-center gap-2 ${
              activeTab === "T4"
                ? "bg-lcars-amber text-slate-950 border-lcars-amber font-bold shadow-md scale-[1.01]"
                : "bg-enterprise-panel border-enterprise-border hover:border-slate-500 text-slate-300"
            }`}
          >
            <Calendar className="w-4 h-4 shrink-0" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-bold tracking-wider leading-none">Tier 4</span>
              <span className="text-[8px] opacity-80 mt-0.5">Prognosticator</span>
            </div>
          </button>

          {/* Quick Stats sidebar widget (Utopia Planitia health tracker) */}
          <div className="hidden xl:flex flex-col bg-slate-950/50 border border-enterprise-border rounded-lg p-3 font-mono text-[10px] mt-auto">
            <span className="text-lcars-orange font-bold block mb-1 uppercase">RESILIENCE REPORT</span>
            <div className="space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Core Temperature:</span>
                <span className="text-slate-200">38.4°C</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>EPS Deflector Hub:</span>
                <span className="text-lcars-green">99% SYNC</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Redundancy Lines:</span>
                <span className="text-lcars-cyan">4 ACTIVE</span>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN TELEMETRY WORKSTAGE */}
        <main className="flex-1">
          {activeTab === "T1" && (
            <div className="flex flex-col gap-4">
              {/* TIER 1 METRIC STRIP (SRI index gauge & KPI summary widget) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                {/* Composite SRI Indicator */}
                <div className="bg-enterprise-panel border border-enterprise-border rounded-lg p-4 flex flex-col justify-between relative overflow-hidden">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">SYSTEM RESILIENCE INDEX (SRI)</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className={`text-3xl font-bold font-mono ${
                      sriScore > 90 ? "text-lcars-green" : sriScore > 75 ? "text-lcars-amber" : "text-lcars-red"
                    }`}>
                      {sriScore}%
                    </span>
                    <span className="text-xs text-slate-400 font-mono">OPTIMAL</span>
                  </div>
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden mt-3">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        sriScore > 90 ? "bg-lcars-green" : sriScore > 75 ? "bg-lcars-amber" : "bg-lcars-red"
                      }`} 
                      style={{ width: `${sriScore}%` }} 
                    />
                  </div>
                </div>

                {/* Average Latency KPI */}
                <div className="bg-enterprise-panel border border-enterprise-border rounded-lg p-4 flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">AVERAGE TRUNK LATENCY</span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className="text-2xl font-bold text-lcars-cyan">13.6 ms</span>
                    <span className="text-[9px] text-lcars-green">NOMINAL</span>
                  </div>
                  <p className="text-[9.5px] font-mono text-slate-500 mt-2">Sol-Proxima sectors path coverage</p>
                </div>

                {/* Global Throughput KPI */}
                <div className="bg-enterprise-panel border border-enterprise-border rounded-lg p-4 flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">GLOBAL EPS DATA VOLTAGE</span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className="text-2xl font-bold text-lcars-amber">4.82 Tbps</span>
                    <span className="text-[9px] text-slate-400">PEAK</span>
                  </div>
                  <p className="text-[9.5px] font-mono text-slate-500 mt-2">Active subcarrier multiplexers load</p>
                </div>

                {/* Redundancy Coverage KPI */}
                <div className="bg-enterprise-panel border border-enterprise-border rounded-lg p-4 flex flex-col justify-between">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block mb-1">REDUNDANCY SEGMENT PATHS</span>
                  <div className="flex items-baseline gap-1 mt-1 font-mono">
                    <span className="text-2xl font-bold text-lcars-green">100%</span>
                    <span className="text-[9px] text-lcars-cyan">FAILOVER READY</span>
                  </div>
                  <p className="text-[9.5px] font-mono text-slate-500 mt-2">Auxiliary loops initialized on hot-standby</p>
                </div>
              </div>

              {/* Topology Map rendering */}
              <TopologyMap 
                subsystems={subsystems} 
                onSelectNode={(nodeName) => {
                  setSelectedNodeName(nodeName);
                  // Auto-switch to Engineering diagnostics for detailed inspects
                  setActiveTab("T3");
                }}
                activeHighlight={activeHighlight}
              />

              {/* Self-healing active events panel logs */}
              <div className="bg-enterprise-panel border border-enterprise-border rounded-lg p-4 font-mono text-xs">
                <span className="text-lcars-cyan font-bold block mb-2 uppercase tracking-wide">
                  ACTIVE SELF-HEALING & AGENT LA FORGE CO-PILOT ACTIONS
                </span>
                <div className="space-y-1 bg-[#040509] p-3 rounded border border-enterprise-border/50 max-h-36 overflow-y-auto">
                  {logs.slice().reverse().map((log, idx) => (
                    <div key={idx} className="flex justify-between items-start gap-4 py-0.5 border-b border-enterprise-border/20 last:border-0">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-500">[{log.timestamp}]</span>
                        <span className="text-lcars-cyan uppercase font-bold text-[10px]">{log.agent}:</span>
                        <span className="text-slate-300 text-[10.5px] leading-relaxed">{log.message}</span>
                      </div>
                      <span className={`text-[9px] shrink-0 font-bold px-1 rounded uppercase ${
                        log.severity === "RESOLVED" 
                          ? "bg-lcars-green/10 text-lcars-green" 
                          : log.severity === "CRITICAL" 
                            ? "bg-lcars-red/10 text-lcars-red animate-pulse" 
                            : "bg-slate-900 text-slate-400"
                      }`}>
                        {log.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "T2" && (
            <div className="flex flex-col gap-4">
              {/* Dependency Grid & Path matrix */}
              <DependencyGraph subsystems={subsystems} activeHighlight={activeHighlight} />

              {/* Secondary Health Matrix Data path detail */}
              <div className="bg-enterprise-panel border border-enterprise-border rounded-lg p-5 font-mono text-xs">
                <span className="text-lcars-cyan font-bold block mb-3 uppercase tracking-wider">
                  DATA CONDUIT ROUTING STREAMS & HEALTH MATRIX
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-enterprise-border/80 text-slate-400 uppercase text-[9px]">
                        <th className="py-2 px-3">System Conduit Segment</th>
                        <th className="py-2 px-3">Primary Path (Latency)</th>
                        <th className="py-2 px-3">Redundancy Status</th>
                        <th className="py-2 px-3">Packet Loss</th>
                        <th className="py-2 px-3">Throughput</th>
                        <th className="py-2 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-enterprise-border/30">
                      {subsystems.map((sys) => (
                        <tr key={sys.id} className="hover:bg-slate-900/30">
                          <td className="py-2.5 px-3 font-bold text-slate-200">{sys.name}</td>
                          <td className="py-2.5 px-3 text-lcars-cyan">{sys.latency} ms</td>
                          <td className="py-2.5 px-3 text-slate-300">{sys.redundancyStatus}</td>
                          <td className="py-2.5 px-3 text-slate-400">{(sys.packetLoss * 100).toFixed(2)}%</td>
                          <td className="py-2.5 px-3 text-slate-300">{sys.throughput} Gbps</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              sys.status === "OPTIMAL" 
                                ? "bg-lcars-green/10 text-lcars-green" 
                                : sys.status === "DEGRADED"
                                  ? "bg-lcars-amber/10 text-lcars-amber"
                                  : "bg-lcars-red/10 text-lcars-red"
                            }`}>
                              {sys.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "T3" && (
            <EngineeringDiagnostics
              nodes={nodes}
              storage={storage}
              logs={logs}
              onAddLog={addLog}
              onIsolateNode={handleIsolateNode}
              onDeployPatch={handleDeployPatch}
              onFailover={handleFailoverTrigger}
              selectedNodeNameFromApp={selectedNodeName}
            />
          )}

          {activeTab === "T4" && (
            <PrognosticatorView
              forecastData={forecastData}
              subsystems={subsystems}
              activeFailures={activeFailures}
              onToggleFailure={handleToggleFailure}
              playbackTime={playbackTime}
              setPlaybackTime={setPlaybackTime}
              onAddLog={addLog}
            />
          )}
        </main>
      </div>

      {/* FOOTER LCARS DECORATIVE BAR */}
      <footer className="mt-4 flex flex-col md:flex-row justify-between items-center bg-enterprise-panel border border-enterprise-border rounded-lg p-3 text-[10px] font-mono text-slate-500 uppercase">
        <div className="flex items-center gap-2">
          <span>LCARS System Core NX-2000-D</span>
          <span className="text-enterprise-border font-bold">|</span>
          <span>Redundant Path Verification Verified</span>
        </div>
        <div className="flex items-center gap-1 mt-2 md:mt-0 text-slate-400">
          <span>Agent Geordi La Forge Interface online</span>
          <span className="w-2 h-2 rounded-full bg-lcars-green inline-block animate-pulse"></span>
        </div>
      </footer>
    </div>
  );
}
