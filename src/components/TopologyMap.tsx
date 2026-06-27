import React, { useState } from "react";
import { SubsystemHealth } from "../types";
import { Globe, MapPin, Activity, ShieldAlert, Wifi } from "lucide-react";

interface TopologyMapProps {
  subsystems: SubsystemHealth[];
  onSelectNode: (nodeName: string) => void;
  activeHighlight: string | null;
}

export default function TopologyMap({ subsystems, onSelectNode, activeHighlight }: TopologyMapProps) {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  // Region static coordinate coordinates for SVG map projection
  const REGIONS = [
    { id: "earth", name: "Earth-Sol Hub", cx: 150, cy: 120, size: 24, label: "Sol Prime Core", subnet: "10.0.1.*" },
    { id: "vulcan", name: "Vulcan-4 Cluster", cx: 450, cy: 100, size: 20, label: "T'Khut Uplink", subnet: "10.4.0.*" },
    { id: "utopia", name: "Utopia Planitia Yard", cx: 280, cy: 220, size: 22, label: "Shipyard Array", subnet: "10.2.2.*" },
    { id: "ds9", name: "Bajor-DS9 Relay", cx: 620, cy: 180, size: 18, label: "Tergum Conduit", subnet: "192.168.9.*" },
    { id: "proxima", name: "Proxima Centauri Sec", cx: 120, cy: 300, size: 16, label: "Outpost Theta", subnet: "10.8.0.*" }
  ];

  // Connections represent main trunk lines
  const CONNECTIONS = [
    { from: "earth", to: "utopia", label: "Sol-Mars Conduit", speed: "1250 Gbps", primary: true },
    { from: "earth", to: "proxima", label: "Proxima Subspace Bridge", speed: "450 Gbps", primary: true },
    { from: "utopia", to: "vulcan", label: "Vulcan-Mars Sector Trunk", speed: "840 Gbps", primary: true },
    { from: "vulcan", to: "ds9", label: "Deep Space Conduit", speed: "620 Gbps", primary: true },
    { from: "earth", to: "vulcan", label: "Direct Sol-Vulcan Backup Link", speed: "100 Gbps", primary: false } // backup path
  ];

  const getSubsystemHealth = (subName: string) => {
    const sys = subsystems.find(s => s.name.toLowerCase().includes(subName.toLowerCase()));
    return sys ? sys.status : "OPTIMAL";
  };

  const getRegionStatusColor = (regionId: string) => {
    // Correlate regions with subsystems for interactive health mapping
    if (regionId === "earth") {
      const warpHealth = getSubsystemHealth("warp");
      return warpHealth === "CRITICAL" ? "stroke-lcars-red fill-lcars-red/20 text-lcars-red" : "stroke-lcars-green fill-lcars-green/10 text-lcars-green";
    }
    if (regionId === "utopia") {
      const chamberHealth = getSubsystemHealth("dilithium");
      return chamberHealth === "CRITICAL" ? "stroke-lcars-red fill-lcars-red/20 text-lcars-red" : "stroke-lcars-amber fill-lcars-amber/10 text-lcars-amber";
    }
    if (regionId === "vulcan") {
      const sensorHealth = getSubsystemHealth("sensor");
      return sensorHealth === "CRITICAL" ? "stroke-lcars-red fill-lcars-red/20 text-lcars-red" : "stroke-lcars-cyan fill-lcars-cyan/10 text-lcars-cyan";
    }
    if (regionId === "proxima") {
      const shieldHealth = getSubsystemHealth("shield");
      return shieldHealth === "CRITICAL" ? "stroke-lcars-red fill-lcars-red/20 text-lcars-red" : "stroke-lcars-green fill-lcars-green/10 text-lcars-green";
    }
    const lifeHealth = getSubsystemHealth("life");
    return lifeHealth === "CRITICAL" ? "stroke-lcars-red fill-lcars-red/20 text-lcars-red" : "stroke-lcars-cyan fill-lcars-cyan/10 text-lcars-cyan";
  };

  const isHighlighted = (regionName: string) => {
    if (!activeHighlight) return false;
    return regionName.toLowerCase().includes(activeHighlight.toLowerCase());
  };

  const handleRegionClick = (region: typeof REGIONS[0]) => {
    setSelectedRegion(region.id);
    onSelectNode(region.name);
  };

  return (
    <div className="bg-enterprise-panel border border-enterprise-border rounded-lg p-5 flex flex-col h-full relative overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-24 h-1 bg-lcars-cyan rounded-bl" />
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-lcars-cyan animate-pulse" />
          <h3 className="text-base font-medium font-mono uppercase tracking-wider text-slate-100 glow-cyan">
            GLOBAL TOPOLOGY MAP (SUBCARRIER DEFLECTION)
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400 uppercase">Sol-Quadrant Segment Alpha</span>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-5 items-center justify-center">
        {/* SVG Space Plot */}
        <div className="w-full md:w-3/5 bg-[#040509] rounded-lg border border-enterprise-border/50 p-3 relative h-[320px] select-none">
          <svg className="w-full h-full" viewBox="0 0 750 360">
            {/* Grid Pattern */}
            <defs>
              <pattern id="space-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ffffff" strokeWidth="0.5" strokeOpacity="0.05" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#space-grid)" />

            {/* Constellation Guide lines / Subspace path corridors */}
            <path d="M 50,50 L 700,50 L 700,320 L 50,320 Z" fill="none" stroke="#212536" strokeWidth="1" strokeDasharray="5,5" />
            
            {/* Draw Redundant Data Paths / Connections */}
            {CONNECTIONS.map((conn, index) => {
              const rFrom = REGIONS.find(r => r.id === conn.from)!;
              const rTo = REGIONS.find(r => r.id === conn.to)!;
              const fromStatus = getRegionStatusColor(conn.from);
              const toStatus = getRegionStatusColor(conn.to);
              
              // If either endpoint is red, the path degrades
              const isDegraded = fromStatus.includes("red") || toStatus.includes("red");
              
              return (
                <g key={index}>
                  {/* Backup paths are dashed */}
                  <line
                    x1={rFrom.cx}
                    y1={rFrom.cy}
                    x2={rTo.cx}
                    y2={rTo.cy}
                    className={`transition-all duration-500 ${
                      !conn.primary 
                        ? "stroke-lcars-orange stroke-[1.5] stroke-dasharray-[5,5]" 
                        : isDegraded 
                          ? "stroke-lcars-red stroke-[2.5]" 
                          : "stroke-lcars-green/70 stroke-[2] hover:stroke-lcars-cyan"
                    }`}
                  />
                  {/* Flow Animation Dot */}
                  <circle r="3" className={isDegraded ? "fill-lcars-red" : "fill-lcars-cyan"}>
                    <animateMotion
                      dur={conn.primary ? "4s" : "7s"}
                      repeatCount="indefinite"
                      path={`M ${rFrom.cx},${rFrom.cy} L ${rTo.cx},${rTo.cy}`}
                    />
                  </circle>
                </g>
              );
            })}

            {/* Draw Star Systems/Regions Nodes */}
            {REGIONS.map((region) => {
              const colorClass = getRegionStatusColor(region.id);
              const isRegionHighlighted = isHighlighted(region.name);
              const isSelected = selectedRegion === region.id;
              
              return (
                <g 
                  key={region.id} 
                  className="cursor-pointer group"
                  onClick={() => handleRegionClick(region)}
                >
                  {/* Glow circle */}
                  <circle
                    cx={region.cx}
                    cy={region.cy}
                    r={region.size + 8}
                    className={`fill-none stroke-[2] transition-all duration-500 opacity-20 group-hover:opacity-60 ${
                      isRegionHighlighted ? "stroke-lcars-amber animate-ping" : "stroke-transparent"
                    }`}
                  />
                  
                  {/* Main Circle node */}
                  <circle
                    cx={region.cx}
                    cy={region.cy}
                    r={region.size}
                    className={`stroke-[2.5] transition-all duration-500 fill-slate-950 hover:stroke-lcars-cyan ${colorClass} ${
                      isSelected ? "stroke-[4px]" : ""
                    }`}
                  />

                  {/* Dynamic pulse for online states */}
                  <circle
                    cx={region.cx}
                    cy={region.cy}
                    r="3"
                    className={colorClass.includes("red") ? "fill-lcars-red animate-ping" : "fill-lcars-cyan"}
                  />

                  {/* Text labels */}
                  <text
                    x={region.cx}
                    y={region.cy - region.size - 6}
                    textAnchor="middle"
                    className={`font-mono text-[10px] font-bold fill-slate-200 tracking-wider ${
                      isRegionHighlighted ? "fill-lcars-amber glow-amber scale-105" : ""
                    }`}
                  >
                    {region.name.split(" ")[0].toUpperCase()}
                  </text>
                  
                  <text
                    x={region.cx}
                    y={region.cy + region.size + 14}
                    textAnchor="middle"
                    className="font-mono text-[8px] fill-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    {region.subnet}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend Overlay */}
          <div className="absolute bottom-3 left-3 bg-enterprise-dark/90 px-2 py-1.5 border border-enterprise-border rounded flex gap-3 text-[9px] font-mono">
            <div className="flex items-center gap-1 text-lcars-green"><span className="w-1.5 h-1.5 rounded-full bg-lcars-green inline-block"></span> OPTIMAL</div>
            <div className="flex items-center gap-1 text-lcars-amber"><span className="w-1.5 h-1.5 rounded-full bg-lcars-amber inline-block"></span> WARNING</div>
            <div className="flex items-center gap-1 text-lcars-red"><span className="w-1.5 h-1.5 rounded-full bg-lcars-red inline-block"></span> DEGRADED</div>
            <div className="flex items-center gap-1 text-lcars-orange"><span className="w-1.5 h-1.5 rounded-full bg-lcars-orange inline-block"></span> BACKUP LINE</div>
          </div>
        </div>

        {/* Selected Regional Node Details panel */}
        <div className="w-full md:w-2/5 flex flex-col justify-between self-stretch bg-slate-950/40 border border-enterprise-border/50 rounded-lg p-4">
          {selectedRegion ? (() => {
            const reg = REGIONS.find(r => r.id === selectedRegion)!;
            const health = reg.id === "earth" ? getSubsystemHealth("warp") : reg.id === "utopia" ? getSubsystemHealth("dilithium") : reg.id === "vulcan" ? getSubsystemHealth("sensor") : getSubsystemHealth("shield");
            
            return (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-enterprise-border pb-2 mb-3">
                    <span className="text-xs font-mono text-lcars-cyan font-bold uppercase tracking-wider">{reg.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      health === "CRITICAL" ? "bg-lcars-red/10 border-lcars-red text-lcars-red glow-red" : "bg-lcars-green/10 border-lcars-green text-lcars-green"
                    }`}>
                      {health}
                    </span>
                  </div>

                  <ul className="space-y-2 text-xs font-mono">
                    <li className="flex justify-between">
                      <span className="text-slate-400">Tactical Array:</span>
                      <span className="text-slate-200">{reg.label}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Subnet Scope:</span>
                      <span className="text-slate-200 text-right">{reg.subnet}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Trunk Multiplex:</span>
                      <span className="text-slate-200">Subspace Band 4</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-400">Duplex Failover:</span>
                      <span className="text-lcars-amber">AUTOMATIC ACTIVE</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-4 border-t border-enterprise-border/30 pt-3 flex flex-col gap-2">
                  <span className="text-[10px] text-slate-500 font-mono uppercase">CONDUIT ACTION ROUTE:</span>
                  <div className="flex gap-2 text-xs font-mono">
                    <button 
                      onClick={() => onSelectNode(reg.name)}
                      className="flex-1 text-center py-1.5 rounded bg-lcars-cyan hover:bg-cyan-600 text-slate-950 font-bold tracking-wider transition-colors duration-200 uppercase"
                    >
                      Engineering Feed
                    </button>
                  </div>
                </div>
              </div>
            );
          })() : (
            <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 font-mono py-10">
              <MapPin className="w-8 h-8 text-lcars-amber mb-2 animate-bounce" />
              <p className="text-xs leading-relaxed">SELECT A SUB-SECTOR CLUSTER ON THE PROJECTED CHART TO INITIATE COUPLING DIAGNOSTIC SCAN.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
