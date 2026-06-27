import React, { useState, useEffect, useRef } from "react";
import { NodeHealth, StorageArrayState, ActionLogEntry } from "../types";
import { Server, Thermometer, Cpu, Sliders, Play, AlertOctagon, RefreshCw, Layers, Terminal, Search } from "lucide-react";

interface EngineeringDiagnosticsProps {
  nodes: NodeHealth[];
  storage: StorageArrayState[];
  logs: ActionLogEntry[];
  onAddLog: (logMessage: string, severity: "INFO" | "WARNING" | "CRITICAL" | "RESOLVED") => void;
  onIsolateNode: (nodeId: string) => void;
  onDeployPatch: (subsystemId: string) => void;
  onFailover: (subsystemId: string) => void;
  selectedNodeNameFromApp: string | null;
}

export default function EngineeringDiagnostics({
  nodes,
  storage,
  logs,
  onAddLog,
  onIsolateNode,
  onDeployPatch,
  onFailover,
  selectedNodeNameFromApp
}: EngineeringDiagnosticsProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string>("node-bravo-7");
  const [logFilter, setLogFilter] = useState<string>("ALL");
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Sync with selected node from Tier 1 Map click
  useEffect(() => {
    if (selectedNodeNameFromApp) {
      const match = nodes.find(n => n.name.toLowerCase() === selectedNodeNameFromApp.toLowerCase() || selectedNodeNameFromApp.toLowerCase().includes(n.id.replace("node-", "")));
      if (match) {
        setSelectedNodeId(match.id);
      }
    }
  }, [selectedNodeNameFromApp, nodes]);

  // Scroll logs to bottom on update
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const currentNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  // Simulated process container list for current node
  const PROCESSES = [
    { name: "dilithium-regulator.service", cpu: Math.round(currentNode.cpu * 0.45), status: currentNode.status === "OFFLINE" ? "STOPPED" : "RUNNING" },
    { name: "shield-stabilizer-v4.wasm", cpu: Math.round(currentNode.cpu * 0.3), status: currentNode.status === "OFFLINE" ? "STOPPED" : "RUNNING" },
    { name: "subspace-duplexer.bin", cpu: Math.round(currentNode.cpu * 0.15), status: currentNode.status === "OFFLINE" ? "STOPPED" : "RUNNING" },
    { name: "laforge-telemetry-collector", cpu: 3, status: currentNode.status === "OFFLINE" ? "STOPPED" : "RUNNING" }
  ];

  const handleAction = (actionType: string) => {
    if (actionType === "isolate") {
      onIsolateNode(currentNode.id);
    } else if (actionType === "patch") {
      onDeployPatch(currentNode.connections[0] || "Life Support");
    } else if (actionType === "failover") {
      onFailover(currentNode.connections[0] || "Warp Core");
    }
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter === "ALL") return true;
    return log.severity === logFilter;
  });

  return (
    <div className="bg-enterprise-panel border border-enterprise-border rounded-lg p-5 flex flex-col h-full relative">
      <div className="absolute top-0 right-0 w-24 h-1 bg-lcars-red rounded-bl" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mb-5 border-b border-enterprise-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-lcars-red" />
          <h3 className="text-base font-medium font-mono uppercase tracking-wider text-slate-100 glow-red">
            ENGINEERING BAY DIAGNOSTICS
          </h3>
        </div>
        
        {/* Node Tabs */}
        <div className="flex flex-wrap gap-1">
          {nodes.map(node => (
            <button
              key={node.id}
              onClick={() => setSelectedNodeId(node.id)}
              className={`font-mono text-[10px] px-2.5 py-1 rounded transition-all border uppercase ${
                selectedNodeId === node.id
                  ? "bg-lcars-red/15 border-lcars-red text-lcars-red font-bold"
                  : "bg-slate-900 border-enterprise-border hover:border-slate-500 text-slate-300"
              }`}
            >
              {node.name.replace("Node ", "")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Node Sensor Metrics */}
        <div className="bg-slate-950/40 border border-enterprise-border/50 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-enterprise-border/30 pb-2 mb-3">
              <span className="text-xs font-mono font-bold text-lcars-red uppercase flex items-center gap-1">
                <Server className="w-3.5 h-3.5" /> METRICS: {currentNode.name.toUpperCase()}
              </span>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                currentNode.status === "ONLINE" 
                  ? "bg-lcars-green/10 text-lcars-green border border-lcars-green/30" 
                  : currentNode.status === "STANDBY"
                    ? "bg-lcars-amber/10 text-lcars-amber border border-lcars-amber/30"
                    : "bg-lcars-red/10 text-lcars-red border border-lcars-red/30"
              }`}>
                {currentNode.status}
              </span>
            </div>

            <div className="space-y-3.5 font-mono">
              {/* CPU core usage */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>CPU INTAKE THREAD</span>
                  <span className="text-slate-200">{currentNode.cpu}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${currentNode.status === "OFFLINE" ? "bg-slate-700" : "bg-lcars-red"}`}
                    style={{ width: `${currentNode.cpu}%` }} 
                  />
                </div>
              </div>

              {/* RAM core usage */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>MEMORY STORAGE CELL</span>
                  <span className="text-slate-200">{currentNode.ram}%</span>
                </div>
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${currentNode.status === "OFFLINE" ? "bg-slate-700" : "bg-lcars-cyan"}`}
                    style={{ width: `${currentNode.ram}%` }} 
                  />
                </div>
              </div>

              {/* Temp core usage */}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 flex items-center gap-1 uppercase"><Thermometer className="w-3.5 h-3.5 text-lcars-red" /> Core Temp</span>
                <span className={`font-bold ${currentNode.temp > 40 ? "text-lcars-red animate-pulse" : "text-slate-200"}`}>
                  {currentNode.temp}°C
                </span>
              </div>
            </div>

            {/* Simulated Process Containers */}
            <div className="mt-5">
              <span className="text-[10px] font-mono font-bold text-slate-400 block mb-2 uppercase tracking-wide">
                ACTIVE CONTAINER DAEMONS
              </span>
              <div className="space-y-1.5 font-mono text-[10px]">
                {PROCESSES.map((proc, index) => (
                  <div key={index} className="flex justify-between p-1 bg-slate-900/50 rounded border border-enterprise-border/30">
                    <span className="text-slate-300 truncate w-[160px]">{proc.name}</span>
                    <span className="text-slate-500">{proc.cpu}% CPU</span>
                    <span className={proc.status === "RUNNING" ? "text-lcars-green" : "text-lcars-red"}>
                      {proc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contextual Actions Panel */}
          <div className="mt-5 pt-3 border-t border-enterprise-border/30">
            <span className="text-[10px] font-mono text-slate-500 block mb-2 uppercase">DIRECTIVE CONTROLS</span>
            <div className="grid grid-cols-3 gap-2 text-[10px] font-mono">
              <button
                onClick={() => handleAction("isolate")}
                disabled={currentNode.status === "OFFLINE"}
                className={`py-1.5 rounded text-center font-bold tracking-wider transition-all duration-200 uppercase ${
                  currentNode.status === "OFFLINE"
                    ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                    : "bg-lcars-red text-slate-950 hover:bg-red-600 shadow-sm"
                }`}
              >
                Isolate
              </button>
              <button
                onClick={() => handleAction("patch")}
                className="py-1.5 rounded text-center bg-lcars-cyan hover:bg-cyan-600 text-slate-950 font-bold tracking-wider transition-all duration-200 uppercase"
              >
                Patch
              </button>
              <button
                onClick={() => handleAction("failover")}
                className="py-1.5 rounded text-center bg-lcars-amber hover:bg-yellow-600 text-slate-950 font-bold tracking-wider transition-all duration-200 uppercase"
              >
                Failover
              </button>
            </div>
          </div>
        </div>

        {/* Storage performance arrays */}
        <div className="bg-slate-950/40 border border-enterprise-border/50 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-enterprise-border/30 pb-2 mb-3">
              <span className="text-xs font-mono font-bold text-lcars-orange uppercase flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> REPLICATION STORAGE ARRAYS
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase">SAN Telemetry</span>
            </div>

            <div className="space-y-4">
              {storage.map(st => (
                <div key={st.id} className="p-3 bg-slate-900/40 rounded border border-enterprise-border/30 font-mono text-xs">
                  <div className="flex justify-between mb-2">
                    <span className="text-lcars-amber font-bold text-[10px] uppercase">{st.name}</span>
                    <span className="text-slate-300 text-[10px]">{st.capacityUsed}% Used</span>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">IOPS:</span>
                      <span className="text-slate-300">{(st.iops / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">LATENCY:</span>
                      <span className="text-slate-300">{st.latency} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Q DEPTH:</span>
                      <span className="text-slate-300">{st.queueDepth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">SYNC LAG:</span>
                      <span className={st.replicationSyncLag > 2 ? "text-lcars-red font-bold animate-pulse" : "text-lcars-green"}>
                        {st.replicationSyncLag} s
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-enterprise-border/30 text-[9px] font-mono text-slate-500 leading-normal uppercase">
            REPLICATION CHANNEL SECURITY STATUS: <span className="text-lcars-green font-bold">ENCRYPTED SOLID SHA-512 SECURE</span>
          </div>
        </div>

        {/* Live filtered log terminal */}
        <div className="bg-[#040509] border border-enterprise-border rounded-lg p-3 flex flex-col h-[320px] justify-between">
          <div className="flex items-center justify-between border-b border-enterprise-border pb-2 mb-2 font-mono text-xs">
            <span className="text-lcars-cyan font-bold flex items-center gap-1 uppercase">
              <Terminal className="w-3.5 h-3.5" /> SUB-CORRIDOR ACTION LOGS
            </span>
            
            {/* Log Filter Selector */}
            <div className="flex gap-1 text-[9px]">
              {["ALL", "INFO", "WARNING", "CRITICAL", "RESOLVED"].map(filterType => (
                <button
                  key={filterType}
                  onClick={() => setLogFilter(filterType)}
                  className={`px-1 rounded border uppercase ${
                    logFilter === filterType
                      ? "bg-lcars-cyan text-slate-950 font-bold border-lcars-cyan"
                      : "bg-slate-950 border-enterprise-border/70 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {filterType}
                </button>
              ))}
            </div>
          </div>

          {/* Scrolling terminal window */}
          <div 
            ref={logContainerRef}
            className="flex-1 overflow-y-auto space-y-1.5 font-mono text-[9px] pr-1"
          >
            {filteredLogs.map(log => {
              let color = "text-slate-300";
              if (log.severity === "CRITICAL") color = "text-lcars-red font-bold bg-lcars-red/10 px-1 rounded";
              if (log.severity === "WARNING") color = "text-lcars-orange";
              if (log.severity === "RESOLVED") color = "text-lcars-green";

              return (
                <div key={log.id} className="leading-relaxed hover:bg-slate-900/30 p-0.5 rounded transition-colors duration-150">
                  <span className="text-slate-500">[{log.timestamp}]</span>{" "}
                  <span className="text-lcars-amber font-bold uppercase">{log.agent}:</span>{" "}
                  <span className={color}>{log.message}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-2 border-t border-enterprise-border pt-1.5 flex gap-2">
            <span className="text-[8px] font-mono text-slate-500 uppercase self-center">Computer Core Stream:</span>
            <div className="flex-1 bg-slate-950 border border-enterprise-border/60 rounded px-2 py-0.5 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-lcars-green inline-block animate-ping mr-2"></span>
              <span className="text-[8px] font-mono text-lcars-green uppercase tracking-wider">Tether online</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
