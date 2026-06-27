import React from "react";
import { SubsystemHealth } from "../types";
import { Network, ArrowRight, ShieldCheck, Zap, Server, Activity } from "lucide-react";

interface DependencyGraphProps {
  subsystems: SubsystemHealth[];
  activeHighlight: string | null;
}

export default function DependencyGraph({ subsystems, activeHighlight }: DependencyGraphProps) {
  // Map subsystems to service boxes with fixed layout coordinates
  const SERVICES = [
    { id: "dilithium-chamber", label: "DILITHIUM CHAMBER", subName: "Dilithium Chamber (Beta-7)", x: 50, y: 150, icon: Zap, color: "border-lcars-orange text-lcars-orange bg-lcars-orange/5" },
    { id: "warp-control", label: "WARP ENGINE CONTROL", subName: "Warp Control (Alpha-Prime)", x: 260, y: 50, icon: Server, color: "border-lcars-cyan text-lcars-cyan bg-lcars-cyan/5" },
    { id: "shield-array", label: "DEFLECTOR SHIELDS", subName: "Shield Array (Delta-Rho)", x: 260, y: 250, icon: ShieldCheck, color: "border-lcars-green text-lcars-green bg-lcars-green/5" },
    { id: "sensor-array", label: "LONG RANGE SENSORS", subName: "Sensor Array (Gamma-5)", x: 480, y: 150, icon: Activity, color: "border-lcars-purple text-lcars-purple bg-lcars-purple/5" },
    { id: "life-support", label: "LIFE SUPPORT GRID", subName: "Life Support (Epsilon-9)", x: 480, y: 270, icon: Server, color: "border-lcars-blue text-lcars-blue bg-lcars-blue/5" }
  ];

  const LINKS = [
    { from: "dilithium-chamber", to: "warp-control", label: "Electro-Plasma Conduit" },
    { from: "warp-control", to: "shield-array", label: "Power Grid Coupling" },
    { from: "dilithium-chamber", to: "shield-array", label: "Auxiliary Inductor feed" },
    { from: "sensor-array", to: "warp-control", label: "Tachyon Navigation Feed" },
    { from: "shield-array", to: "life-support", label: "Emergency Power Shunt" }
  ];

  const getSubsystemStatus = (subName: string) => {
    const sys = subsystems.find(s => s.name === subName);
    return sys ? sys.status : "OPTIMAL";
  };

  const getSubsystemMetrics = (subName: string) => {
    return subsystems.find(s => s.name === subName);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "CRITICAL": return "border-lcars-red bg-lcars-red/15 text-lcars-red shadow-[0_0_12px_rgba(239,68,68,0.25)]";
      case "DEGRADED": return "border-lcars-orange bg-lcars-orange/10 text-lcars-orange";
      case "STANDBY": return "border-lcars-amber bg-lcars-amber/10 text-lcars-amber";
      default: return "border-lcars-green/40 bg-slate-900/60 text-slate-100";
    }
  };

  return (
    <div className="bg-enterprise-panel border border-enterprise-border rounded-lg p-5 flex flex-col h-full relative">
      <div className="absolute top-0 right-0 w-24 h-1 bg-lcars-amber rounded-bl" />
      
      <div className="flex items-center justify-between mb-4 border-b border-enterprise-border/50 pb-2">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-lcars-amber" />
          <h3 className="text-base font-medium font-mono uppercase tracking-wider text-slate-100 glow-amber">
            DYNAMIC SERVICE DEPENDENCY GRAPH
          </h3>
        </div>
        <span className="text-xs font-mono text-lcars-amber">EPS GRID LEVEL III</span>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Interactive Map */}
        <div className="lg:col-span-2 bg-[#040509] border border-enterprise-border/50 rounded-lg p-2 h-[320px] relative overflow-hidden select-none">
          <svg className="w-full h-full" viewBox="0 0 700 350">
            {/* Connection Paths */}
            {LINKS.map((link, idx) => {
              const fromNode = SERVICES.find(n => n.id === link.from)!;
              const toNode = SERVICES.find(n => n.id === link.to)!;
              
              const fromStatus = getSubsystemStatus(fromNode.subName);
              const toStatus = getSubsystemStatus(toNode.subName);
              const isPathCut = fromStatus === "CRITICAL" || toStatus === "CRITICAL";
              
              const x1 = fromNode.x + 80;
              const y1 = fromNode.y + 25;
              const x2 = toNode.x + 80;
              const y2 = toNode.y + 25;
              
              return (
                <g key={idx}>
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    className={`transition-colors duration-500 ${
                      isPathCut 
                        ? "stroke-lcars-red stroke-[2] stroke-dasharray-[4,4]" 
                        : "stroke-lcars-cyan/30 stroke-2"
                    }`}
                  />
                  {!isPathCut && (
                    <circle r="2.5" className="fill-lcars-amber">
                      <animateMotion
                        dur="3s"
                        repeatCount="indefinite"
                        path={`M ${x1},${y1} L ${x2},${y2}`}
                      />
                    </circle>
                  )}
                </g>
              );
            })}

            {/* Service Node Cards */}
            {SERVICES.map((node) => {
              const status = getSubsystemStatus(node.subName);
              const metrics = getSubsystemMetrics(node.subName);
              const statusClass = getStatusStyle(status);
              const IconComp = node.icon;
              const isNodeHighlighted = activeHighlight && node.subName.toLowerCase().includes(activeHighlight.toLowerCase());

              return (
                <g key={node.id} className="cursor-pointer">
                  {/* Highlight Glow ring */}
                  {isNodeHighlighted && (
                    <rect
                      x={node.x - 4}
                      y={node.y - 4}
                      width="168"
                      height="64"
                      rx="8"
                      className="fill-none stroke-lcars-amber stroke-2 animate-pulse"
                    />
                  )}

                  {/* Main Service Box */}
                  <foreignObject
                    x={node.x}
                    y={node.y}
                    width="160"
                    height="56"
                  >
                    <div className={`w-full h-full border rounded-md p-2 flex flex-col justify-between transition-all duration-300 font-mono text-[10px] ${statusClass}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold tracking-tight text-[9px] truncate w-[110px]">{node.label}</span>
                        <IconComp className={`w-3 h-3 ${status === "CRITICAL" ? "animate-bounce" : ""}`} />
                      </div>
                      <div className="flex items-end justify-between text-[8px] opacity-80 mt-1">
                        <span>CPU: {metrics?.resourceUsage.cpu}%</span>
                        <span className={status === "CRITICAL" ? "text-lcars-red font-bold" : "text-slate-400"}>
                          {status}
                        </span>
                      </div>
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Aggregate Resource pool utilisation / backup matrix */}
        <div className="flex flex-col justify-between bg-slate-950/40 border border-enterprise-border/50 rounded-lg p-4">
          <h4 className="text-xs font-mono font-bold text-lcars-amber mb-3 uppercase tracking-wider">
            RESOURCE POOL SATURATION FORECAST
          </h4>

          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {/* CPU Pool */}
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-slate-400 uppercase">Plasma Regulator Load (CPU)</span>
                <span className="text-slate-200">62.5%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-enterprise-border/30">
                <div className="bg-gradient-to-r from-lcars-cyan to-lcars-amber h-full rounded-full transition-all duration-500" style={{ width: "62.5%" }} />
              </div>
            </div>

            {/* RAM Pool */}
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-slate-400 uppercase">Buffer Memory allocation (RAM)</span>
                <span className="text-slate-200">65.0%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-enterprise-border/30">
                <div className="bg-gradient-to-r from-lcars-cyan to-lcars-amber h-full rounded-full transition-all duration-500" style={{ width: "65%" }} />
              </div>
            </div>

            {/* Disk Pool */}
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-slate-400 uppercase">Storage Subnet Array</span>
                <span className="text-lcars-orange">60.1%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-enterprise-border/30">
                <div className="bg-gradient-to-r from-lcars-cyan to-lcars-orange h-full rounded-full transition-all duration-500" style={{ width: "60.1%" }} />
              </div>
            </div>

            {/* Network Pool */}
            <div>
              <div className="flex justify-between text-[11px] font-mono mb-1">
                <span className="text-slate-400 uppercase">EPS Wave Bandwidth</span>
                <span className="text-lcars-green">48.2%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-enterprise-border/30">
                <div className="bg-gradient-to-r from-lcars-cyan to-lcars-green h-full rounded-full transition-all duration-500" style={{ width: "48.2%" }} />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-enterprise-border/50 text-[10px] font-mono text-slate-400 leading-relaxed bg-[#040509] p-2 border rounded border-enterprise-border/30">
            <span className="text-lcars-green uppercase font-bold block mb-1">FAILOVER COMPASS:</span>
            Primary bus is <span className="text-lcars-green">ACTIVE</span>. Redundant paths stand pre-loaded at <span className="text-lcars-cyan">98.5% sync</span> with sub-microsecond failover trigger locks.
          </div>
        </div>
      </div>
    </div>
  );
}
