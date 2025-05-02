// Uptime Robot types
export interface UptimeMonitor {
  friendly_name: string;
  monitors_id: Record<string, UptimeMonitorDetails>;
  custom_url: string;
}

export interface UptimeMonitorDetails {
  friendly_name: string;
  status: string;
  url: string;
  incidents: UptimeIncident[];
}

export interface UptimeIncident {
  last_down: string;
}

// Atera types
export interface AteraAlert {
  alert_id: string;
  DeviceName: string;
  CustomerName: string;
  AlertMessage: string;
  incidents: AteraIncident[];
  resolved: string | null;
}

export interface AteraIncident {
  created: string;
}

// Aruba types
export interface ArubaSite {
  site_name: string;
  total_devices: number;
  total_devices_problem: number;
  devices: ArubaDevice[];
}

export interface ArubaDevice {
  device_name: string;
  model: string;
  ip: string;
  mac: string;
  status: string;
  last_seen: string;
  seconds_offline: number;
}

// External Services types
export interface ExternalServices {
  services: Record<string, string>;
  timestamp: string;
}

export interface ServiceStatus {
  name: string;
  status: string;
  statusText: string;
  statusUrl: string;
}

// Backup Alerts types
export interface BackupAlerts {
  [client: string]: BackupAlert;
}

export interface BackupAlert {
  Estado: string;
  FechaEnvio: string;
  Cuerpo: string;
}

// Dashboard Status Summary
export interface StatusSummary {
  critical: number;
  warning: number;
  operational: number;
}

// WebSocket Types
export interface WebSocketMonitoringData {
  uptime: UptimeMonitor[] | null;
  atera: AteraAlert[] | null;
  aruba: ArubaSite[] | null;
  rss: ExternalServices | null;
  gmail: BackupAlerts | null;
  timestamp: string;
}
