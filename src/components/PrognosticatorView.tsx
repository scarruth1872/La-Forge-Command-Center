import React, { useState } from "react";
import { ForecastPoint, SubsystemHealth, ActionLogEntry } from "../types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Calendar, HelpCircle, AlertTriangle, Play, Pause, Rewind, FileText, CheckCircle2 } from "lucide-react";

interface PrognosticatorViewProps {
  forecastData: ForecastPoint[];
  subsystems: SubsystemHealth[];
  activeFailures: Record<string, boolean>;
  onToggleFailure: (subsystemId: string) => void;
  playbackTime: number; // 0 (now), or -1, -2, -3 etc. (minutes in past)
  setPlaybackTime: (time: number) => void;
  onAddLog: (logMessage: string, severity: "INFO" | "WARNING" | "CRITICAL" | "RESOLVED") => void;
}

export default function PrognosticatorView({
  forecastData,
  subsystems,
  activeFailures,
  onToggleFailure,
  playbackTime,
  setPlaybackTime,
  onAddLog
}: PrognosticatorViewProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showReport, setShowReport] = useState<boolean>(false);
  const [simulatedLoadType, setSimulatedLoadType] = useState<string>("STANDARD");

  // Run auto playback ticker
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        if (playbackTime >= 0) {
          setPlaybackTime(-10); // Wrap around to past
        } else {
          setPlaybackTime(playbackTime + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, setPlaybackTime, playbackTime]);

  const handleGenerateReport = () => {
    setShowReport(true);
    onAddLog("Automated diagnostic report compiled for Starfleet Command.", "INFO");
  };

  return (
    <div className="bg-enterprise-panel border border-enterprise-border rounded-lg p-5 flex flex-col h-full relative">
      <div className="absolute top-0 right-0 w-24 h-1 bg-lcars-purple rounded-bl" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-5 border-b border-enterprise-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-lcars-purple" />
          <h3 className="text-base font-medium font-mono uppercase tracking-wider text-slate-100 glow-purple">
            THE PROGNOSTICATOR: PREDICTIVE FORECASTING
          </h3>
        </div>
        <span className="text-xs font-mono text-lcars-purple uppercase">Trajectory Module v7.1</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Trend analysis chart using Recharts */}
        <div className="xl:col-span-2 bg-slate-950/40 border border-enterprise-border/50 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 font-mono text-xs">
              <span className="text-lcars-purple font-bold uppercase">30-DAY CAPACITY SATURATION PREDICTION</span>
              <span className="text-lcars-red uppercase font-bold text-[10px] animate-pulse">
                CRITICAL WARNING: Storage Gamma-7 Saturates in 37.2 Days
              </span>
            </div>

            <div className="h-[220px] w-full font-mono text-[9px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecastData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00bcd4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00bcd4" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorStorage" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#212536" strokeOpacity={0.5} />
                  <XAxis dataKey="day" stroke="#52525b" tickFormatter={(v) => `Day ${v}`} />
                  <YAxis stroke="#52525b" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#11131c", border: "1px solid #212536", fontFamily: "monospace" }}
                    labelStyle={{ color: "#f9a825", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="cpu" stroke="#00bcd4" strokeWidth={1.5} fillOpacity={1} fill="url(#colorCpu)" name="CPU Usage" />
                  <Area type="monotone" dataKey="storage" stroke="#ef4444" strokeWidth={1.5} fillOpacity={1} fill="url(#colorStorage)" name="Storage Space" />
                  <Area type="monotone" dataKey="storageProjected" stroke="#ef4444" strokeWidth={1} strokeDasharray="3 3" fillOpacity={0} name="Projected Storage" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Time playback timeline slider */}
          <div className="mt-4 pt-4 border-t border-enterprise-border/30 bg-slate-900/30 rounded p-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-2 font-mono text-xs">
              <span className="text-slate-300 font-bold uppercase flex items-center gap-1">
                <Rewind className="w-3.5 h-3.5 text-lcars-cyan" /> Historical Playback Controller
              </span>
              <div className="flex gap-1.5 items-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-2 py-1 rounded bg-lcars-cyan hover:bg-cyan-600 text-slate-950 font-bold font-mono text-[9px] uppercase flex items-center gap-1 transition-colors duration-200"
                >
                  {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                  {isPlaying ? "Pause" : "Play Loop"}
                </button>
                <button
                  onClick={() => { setPlaybackTime(0); setIsPlaying(false); }}
                  className="px-2 py-1 rounded border border-enterprise-border hover:bg-slate-800 text-slate-400 font-mono text-[9px] uppercase"
                >
                  Live Feed
                </button>
              </div>
            </div>

            {/* Range slider */}
            <div className="flex items-center gap-3 mt-3">
              <span className="text-[10px] font-mono text-slate-500">-10m (Incident)</span>
              <input
                type="range"
                min="-10"
                max="0"
                value={playbackTime}
                onChange={(e) => { setPlaybackTime(parseInt(e.target.value)); setIsPlaying(false); }}
                className="flex-1 accent-lcars-cyan bg-slate-950 h-1.5 rounded-full cursor-pointer"
              />
              <span className="text-[10px] font-mono text-lcars-cyan font-bold">
                {playbackTime === 0 ? "REAL-TIME (LIVE)" : `${playbackTime}m ago`}
              </span>
            </div>
            
            <p className="text-[9px] font-mono text-slate-500 mt-2 leading-relaxed">
              *REWINDS ALL GRAPHICS & METRICS TO INCIDENT POINTS TO REPLAY THE AUTOMATED HEALING ALGORITHMS ENGAGING IN REAL-TIME.
            </p>
          </div>
        </div>

        {/* "What-If" failure simulation module */}
        <div className="bg-slate-950/40 border border-enterprise-border/50 rounded-lg p-4 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-1 border-b border-enterprise-border/30 pb-2 mb-3">
              <HelpCircle className="w-4 h-4 text-lcars-amber" />
              <span className="text-xs font-mono font-bold text-lcars-amber uppercase">
                &quot;WHAT-IF&quot; SCENARIO MATRIX
              </span>
            </div>

            <p className="text-[10px] font-mono text-slate-400 leading-relaxed mb-4">
              Manually trigger custom failures across key Starfleet clusters to validate failover path compliance. Watch the self-healing logs engage!
            </p>

            {/* Failure Checkbox toggles */}
            <div className="space-y-2 font-mono text-[10.5px]">
              {subsystems.map((sys) => {
                const isFailed = !!activeFailures[sys.id];
                return (
                  <label 
                    key={sys.id} 
                    className={`flex items-center justify-between p-2 rounded border cursor-pointer select-none transition-all ${
                      isFailed 
                        ? "bg-lcars-red/10 border-lcars-red text-lcars-red shadow-sm" 
                        : "bg-slate-900/40 border-enterprise-border/50 text-slate-300 hover:bg-slate-900/80"
                    }`}
                  >
                    <span>{sys.name.split(" ")[0].toUpperCase()} GRID FAILURE</span>
                    <input
                      type="checkbox"
                      checked={isFailed}
                      onChange={() => onToggleFailure(sys.id)}
                      className="accent-lcars-red w-3.5 h-3.5 cursor-pointer ml-3"
                    />
                  </label>
                );
              })}
            </div>

            {/* Simulated Load selector */}
            <div className="mt-4 pt-3 border-t border-enterprise-border/30 font-mono text-[10px]">
              <span className="text-slate-500 block mb-1.5 uppercase">Sector Load Coefficient:</span>
              <div className="grid grid-cols-3 gap-1 text-[9px]">
                {["STANDARD", "ION STORM", "BORG ATTACK"].map((load) => (
                  <button
                    key={load}
                    onClick={() => {
                      setSimulatedLoadType(load);
                      onAddLog(`System load threshold toggled to coefficients of: ${load}.`, "INFO");
                    }}
                    className={`py-1 rounded border uppercase ${
                      simulatedLoadType === load
                        ? "bg-lcars-amber border-lcars-amber text-slate-950 font-bold"
                        : "bg-slate-900 border-enterprise-border/60 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {load}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Starfleet report generator */}
          <div className="mt-5 border-t border-enterprise-border/30 pt-3">
            <button
              onClick={handleGenerateReport}
              className="w-full flex items-center justify-center gap-2 py-2 rounded bg-lcars-purple hover:bg-purple-600 text-slate-950 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors duration-200"
            >
              <FileText className="w-4 h-4" /> Compile Operations Report
            </button>
          </div>
        </div>
      </div>

      {/* Embedded Report Modal/Overlay */}
      {showReport && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4 font-mono">
          <div className="bg-enterprise-panel border-2 border-lcars-purple rounded-lg p-6 max-w-lg w-full relative">
            <div className="absolute top-2 right-2">
              <button 
                onClick={() => setShowReport(false)}
                className="text-slate-500 hover:text-slate-200 text-xs px-2 py-1"
              >
                [CLOSE]
              </button>
            </div>

            <div className="flex items-center gap-2 border-b border-enterprise-border pb-3 mb-4">
              <FileText className="w-5 h-5 text-lcars-purple animate-pulse" />
              <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider glow-purple">
                STARFLEET DIAGNOSTIC OPERATIONS REPORT
              </h4>
            </div>

            <div className="space-y-3.5 text-xs leading-relaxed text-slate-300">
              <div className="flex justify-between text-[10px] text-slate-500 uppercase border-b border-enterprise-border/30 pb-1">
                <span>Enterprise NX-01 Computer Core Log</span>
                <span>Date: {new Date().toLocaleDateString()}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>SYSTEM RESILIENCE INDEX (SRI):</span>
                  <span className="text-lcars-green font-bold">94.6% (OPTIMAL)</span>
                </div>
                <div className="flex justify-between">
                  <span>AVERAGE GRID LATENCY:</span>
                  <span className="text-lcars-cyan">13.6 ms</span>
                </div>
                <div className="flex justify-between">
                  <span>REDUNDANCY SEGMENT COVERAGE:</span>
                  <span className="text-lcars-green">100% SECURE</span>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded border border-enterprise-border/60 text-[10px]">
                <span className="text-lcars-amber font-bold block mb-1 uppercase">Commander Geordi La Forge Summary:</span>
                &quot;Warp core magnetics are holding steady with less than 0.04% harmonic flux. The secondary dilithium coupling has completed failover synchronization, providing 100% capacity margin should ion storm turbulence escalate.&quot;
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-enterprise-border flex justify-end">
              <button
                onClick={() => setShowReport(false)}
                className="px-4 py-1.5 rounded bg-lcars-purple text-slate-950 font-bold text-xs uppercase hover:bg-purple-600 transition-colors duration-200"
              >
                Dismiss Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
