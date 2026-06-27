export interface MetricPoint {
  timestamp: string;
  value: number;
}

export interface KPIState {
  avgLatency: number;
  maxLatency: number;
  throughput: number;
  activeAlertCount: number;
  alertSeverityBreakdown: {
    critical: number;
    warning: number;
    info: number;
  };
  redundancyPercent: number;
}

export interface SubsystemHealth {
  id: string;
  name: string;
  status: "OPTIMAL" | "DEGRADED" | "CRITICAL" | "STANDBY";
  latency: number;
  throughput: number;
  packetLoss: number;
  redundancyStatus: string;
  resourceUsage: {
    cpu: number;
    ram: number;
    disk: number;
    network: number;
  };
  details?: string;
}

export interface NodeHealth {
  id: string;
  name: string;
  status: "ONLINE" | "STANDBY" | "OFFLINE";
  region: string;
  cpu: number;
  ram: number;
  temp: number;
  connections: string[];
}

export interface StorageArrayState {
  id: string;
  name: string;
  iops: number;
  latency: number;
  queueDepth: number;
  capacityUsed: number; // percentage
  replicationSyncLag: number; // in seconds
}

export interface ActionLogEntry {
  id: string;
  timestamp: string;
  agent: string;
  message: string;
  severity: "INFO" | "WARNING" | "CRITICAL" | "RESOLVED";
}

export interface ForecastPoint {
  day: number;
  cpu: number;
  memory: number;
  storage: number;
  cpuProjected: number;
  memoryProjected: number;
  storageProjected: number;
}

export interface Alert {
  id: string;
  source: string;
  message: string;
  severity: "WARNING" | "CRITICAL";
  timestamp: string;
  acknowledged: boolean;
}

export interface ComputerResponse {
  response: string;
  action: string;
  target: string;
  analysis?: string;
}
