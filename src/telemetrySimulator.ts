import { SubsystemHealth, NodeHealth, StorageArrayState, ActionLogEntry, ForecastPoint, KPIState, Alert } from "./types";

export const INITIAL_SUBSYSTEMS: SubsystemHealth[] = [
  {
    id: "shield-array",
    name: "Shield Array (Delta-Rho)",
    status: "OPTIMAL",
    latency: 14.5,
    throughput: 840,
    packetLoss: 0.01,
    redundancyStatus: "Primary: GREEN, Backup: STANDBY GREEN",
    resourceUsage: { cpu: 42, ram: 58, disk: 30, network: 65 },
    details: "Phased shielding nodes distributed across Sol/Proxima sectors. Operating on multiplexed subspace carrier wave."
  },
  {
    id: "warp-control",
    name: "Warp Control (Alpha-Prime)",
    status: "OPTIMAL",
    latency: 8.2,
    throughput: 1250,
    packetLoss: 0.0,
    redundancyStatus: "Primary: GREEN, Backup: STANDBY GREEN",
    resourceUsage: { cpu: 68, ram: 72, disk: 45, network: 88 },
    details: "Coordinates dilithium flow and magnetic plasma constriction. Vital for core stability and warp vector orientation."
  },
  {
    id: "life-support",
    name: "Life Support (Epsilon-9)",
    status: "OPTIMAL",
    latency: 22.4,
    throughput: 120,
    packetLoss: 0.05,
    redundancyStatus: "Primary: GREEN, Backup: STANDBY YELLOW",
    resourceUsage: { cpu: 28, ram: 45, disk: 15, network: 12 },
    details: "Atmospheric scrubbers, gravity plating, and thermal regulators distributed across active starbase hubs."
  },
  {
    id: "dilithium-chamber",
    name: "Dilithium Chamber (Beta-7)",
    status: "OPTIMAL",
    latency: 5.1,
    throughput: 1980,
    packetLoss: 0.0,
    redundancyStatus: "Primary: GREEN, Backup: STANDBY GREEN",
    resourceUsage: { cpu: 75, ram: 80, disk: 62, network: 95 },
    details: "Matter-antimatter reaction regulator. High-energy matter stream monitoring via quantum mechanical sensors."
  },
  {
    id: "sensor-array",
    name: "Sensor Array (Gamma-5)",
    status: "OPTIMAL",
    latency: 18.1,
    throughput: 620,
    packetLoss: 0.02,
    redundancyStatus: "Primary: GREEN, Backup: STANDBY GREEN",
    resourceUsage: { cpu: 35, ram: 50, disk: 80, network: 45 },
    details: "Long-range tachyon scanners and navigational radar grid. Feeds active spatial metrics to tactical bridges."
  }
];

export const INITIAL_NODES: NodeHealth[] = [
  { id: "node-bravo-7", name: "Node Bravo-7", status: "ONLINE", region: "Utopia Planitia", cpu: 44, ram: 55, temp: 34.2, connections: ["Shield Array", "Computer Core"] },
  { id: "node-gamma-5", name: "Node Gamma-5", status: "ONLINE", region: "Vulcan-4", cpu: 38, ram: 48, temp: 31.8, connections: ["Sensor Array", "Navigation Grid"] },
  { id: "node-alpha-prime", name: "Node Alpha-Prime", status: "ONLINE", region: "Earth-Sol", cpu: 65, ram: 70, temp: 42.1, connections: ["Warp Control", "Dilithium Regulator"] },
  { id: "node-ds9", name: "Node DS-9", status: "ONLINE", region: "Bajoran Sector", cpu: 52, ram: 60, temp: 38.5, connections: ["Subspace Link", "Defense System"] },
  { id: "node-utopia-backup", name: "Node Utopia-Backup", status: "STANDBY", region: "Utopia Planitia", cpu: 5, ram: 10, temp: 24.5, connections: ["Warp Control", "Shield Array"] }
];

export const INITIAL_STORAGE_ARRAYS: StorageArrayState[] = [
  { id: "storage-gamma-7", name: "Storage Array Gamma-7", iops: 14200, latency: 1.45, queueDepth: 2, capacityUsed: 78.4, replicationSyncLag: 0.2 },
  { id: "alpha-vault", name: "Alpha Sector Log Vault", iops: 8400, latency: 2.12, queueDepth: 1, capacityUsed: 42.1, replicationSyncLag: 0.8 },
  { id: "delta-vault", name: "Delta-Rho Buffer Core", iops: 22100, latency: 0.85, queueDepth: 4, capacityUsed: 59.8, replicationSyncLag: 0.1 }
];

export const INITIAL_LOGS: ActionLogEntry[] = [
  { id: "log-1", timestamp: "08:15:20", agent: "La Forge", message: "Loaded secondary plasma injectors; magnetic deflection holding at 99.4%.", severity: "INFO" },
  { id: "log-2", timestamp: "08:30:11", agent: "La Forge", message: "Automated core diagnostic scan complete. Minor antimatter flow imbalance recalibrated.", severity: "RESOLVED" },
  { id: "log-3", timestamp: "08:45:00", agent: "Computer", message: "Automatic log rotation complete on Alpha Sector Log Vault.", severity: "INFO" },
  { id: "log-4", timestamp: "09:01:05", agent: "Computer", message: "Redundant subspace data channel engaged. Sol-Vulcan transit latency decreased to 14ms.", severity: "INFO" },
  { id: "log-5", timestamp: "09:10:44", agent: "La Forge", message: "Configured dilithium crystals to standard hexagonal matrix layout.", severity: "INFO" }
];

export const INITIAL_ALERTS: Alert[] = [
  { id: "alert-1", source: "Epsilon-9 Life Support", message: "Auxiliary scrubber flow degraded in quadrant 4", severity: "WARNING", timestamp: "09:05:12", acknowledged: false }
];

// Generate 30 days of forecasting metric trend data
export function generateForecastData(): ForecastPoint[] {
  const data: ForecastPoint[] = [];
  for (let i = 1; i <= 30; i++) {
    // Current usage curve
    const baseCpu = 50 + Math.sin(i / 3) * 10 + (i * 0.4);
    const baseMemory = 60 + (i * 0.3);
    const baseStorage = 75 + (i * 0.45); // Storage fills up fastest

    // Projected future trend extending past 30 days
    data.push({
      day: i,
      cpu: Math.min(Math.round(baseCpu), 100),
      memory: Math.min(Math.round(baseMemory), 100),
      storage: Math.min(Math.round(baseStorage), 100),
      cpuProjected: Math.min(Math.round(baseCpu + (i > 20 ? (i - 20) * 0.8 : 0)), 100),
      memoryProjected: Math.min(Math.round(baseMemory + (i > 20 ? (i - 20) * 0.5 : 0)), 100),
      storageProjected: Math.min(Math.round(baseStorage + (i > 15 ? (i - 15) * 1.1 : 0)), 100)
    });
  }
  return data;
}

// Tick simulated telemetry data dynamically
export function tickTelemetry(
  subsystems: SubsystemHealth[],
  nodes: NodeHealth[],
  storage: StorageArrayState[],
  alerts: Alert[],
  activeFailures: Record<string, boolean> = {}
): {
  subsystems: SubsystemHealth[];
  nodes: NodeHealth[];
  storage: StorageArrayState[];
  kpis: KPIState;
} {
  // 1. Tick subsystems
  const tickedSubsystems: SubsystemHealth[] = subsystems.map((sys): SubsystemHealth => {
    const isFailed = activeFailures[sys.id];
    let status: "OPTIMAL" | "DEGRADED" | "CRITICAL" | "STANDBY" = sys.status;
    let latency = sys.latency;
    let throughput = sys.throughput;
    let packetLoss = sys.packetLoss;
    let cpu = sys.resourceUsage.cpu;

    if (isFailed) {
      status = "CRITICAL";
      latency = Math.round(sys.latency * 5 * 10) / 10;
      throughput = Math.round(sys.throughput * 0.25);
      packetLoss = 0.18; // 18% packet loss
      cpu = Math.min(sys.resourceUsage.cpu + 25, 100);
    } else {
      // Small random fluctuations
      const delta = (Math.random() - 0.5) * 0.4;
      latency = Math.max(2, Math.round((sys.latency + delta) * 10) / 10);
      throughput = Math.max(50, Math.round(sys.throughput + (Math.random() - 0.5) * 20));
      packetLoss = Math.max(0, Math.round((sys.packetLoss + (Math.random() - 0.5) * 0.005) * 1000) / 1000);
      cpu = Math.max(10, Math.min(100, Math.round(sys.resourceUsage.cpu + (Math.random() - 0.5) * 4)));
      status = packetLoss > 0.05 ? "DEGRADED" : "OPTIMAL";
    }

    return {
      ...sys,
      status,
      latency,
      throughput,
      packetLoss,
      resourceUsage: {
        ...sys.resourceUsage,
        cpu,
        ram: Math.max(15, Math.min(100, Math.round(sys.resourceUsage.ram + (Math.random() - 0.5) * 2))),
        network: Math.max(10, Math.min(100, Math.round(sys.resourceUsage.network + (Math.random() - 0.5) * 5)))
      }
    };
  });

  // 2. Tick nodes
  const tickedNodes = nodes.map((node) => {
    const isSubsystemFailed = Object.keys(activeFailures).some(
      (sysId) => activeFailures[sysId] && node.connections.some((conn) => conn.toLowerCase().includes(sysId.split("-")[0]))
    );
    let status = node.status;
    let cpu = node.cpu;
    let temp = node.temp;

    if (isSubsystemFailed) {
      status = "OFFLINE";
      cpu = 0;
      temp = 20.2; // Cools down
    } else if (node.status === "STANDBY") {
      cpu = Math.max(2, Math.min(8, Math.round(node.cpu + (Math.random() - 0.5) * 1)));
      temp = Math.max(20, Math.min(26, Math.round((node.temp + (Math.random() - 0.5) * 0.2) * 10) / 10));
    } else {
      // Standard running node
      cpu = Math.max(20, Math.min(95, Math.round(node.cpu + (Math.random() - 0.5) * 6)));
      temp = Math.max(28, Math.min(55, Math.round((node.temp + (Math.random() - 0.5) * 0.5) * 10) / 10));
      status = cpu > 90 ? "STANDBY" : "ONLINE"; // high stress can cause issues
    }

    return { ...node, status, cpu, temp };
  });

  // 3. Tick Storage arrays
  const tickedStorage = storage.map((st) => {
    const isGamma7Issue = activeFailures["sensor-array"] && st.id === "storage-gamma-7";
    let iops = st.iops;
    let latency = st.latency;
    let syncLag = st.replicationSyncLag;

    if (isGamma7Issue) {
      iops = Math.round(st.iops * 0.4);
      latency = Math.round(st.latency * 3 * 100) / 100;
      syncLag = Math.round((st.replicationSyncLag + 4.5) * 10) / 10;
    } else {
      iops = Math.max(1000, Math.round(st.iops + (Math.random() - 0.5) * 200));
      latency = Math.max(0.1, Math.round((st.latency + (Math.random() - 0.5) * 0.08) * 100) / 100);
      syncLag = Math.max(0.01, Math.round((st.replicationSyncLag + (Math.random() - 0.5) * 0.05) * 100) / 100);
    }

    // Slowly accumulate capacity used
    let capacityUsed = st.capacityUsed + 0.001;
    if (capacityUsed > 100) capacityUsed = 100;

    return { ...st, iops, latency, capacityUsed: Math.round(capacityUsed * 100) / 100, replicationSyncLag: syncLag };
  });

  // 4. Compute KPIs & System Resilience Index
  let totalLatency = 0;
  let maxLatency = 0;
  let totalThroughput = 0;
  let healthySubsystems = 0;

  tickedSubsystems.forEach((sys) => {
    totalLatency += sys.latency;
    if (sys.latency > maxLatency) maxLatency = sys.latency;
    totalThroughput += sys.throughput;
    if (sys.status === "OPTIMAL" || sys.status === "STANDBY") {
      healthySubsystems++;
    }
  });

  const avgLatency = Math.round((totalLatency / tickedSubsystems.length) * 10) / 10;
  const activeAlertCount = alerts.filter(a => !a.acknowledged).length;

  // Let's compute a dynamic redundancy coverage percent
  const redundantCount = tickedSubsystems.filter(s => s.redundancyStatus.includes("STANDBY GREEN") || s.redundancyStatus.includes("STANDBY YELLOW")).length;
  const redundancyPercent = Math.round((redundantCount / tickedSubsystems.length) * 100);

  const kpis: KPIState = {
    avgLatency,
    maxLatency,
    throughput: totalThroughput,
    activeAlertCount,
    alertSeverityBreakdown: {
      critical: alerts.filter(a => a.severity === "CRITICAL" && !a.acknowledged).length,
      warning: alerts.filter(a => a.severity === "WARNING" && !a.acknowledged).length,
      info: 2, // baseline simulator indicators
    },
    redundancyPercent
  };

  return {
    subsystems: tickedSubsystems,
    nodes: tickedNodes,
    storage: tickedStorage,
    kpis
  };
}
