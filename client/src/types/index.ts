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
  DeviceGuid: string;
  IpAddress: string;
  Title: string;
  OS: string;
  HardwareDisks?: AteraHardwareDisk[];
  Logo?: string | null;
}

export interface AteraHardwareDisk {
  Drive: string;
  Free: number;
  Total: number;
  Used: number;
}

export interface AteraIncident {
  created: string;
}

// Aruba types
export interface ArubaSite {
  site_name: string;
  site_id: string;
  total_devices: number;
  total_devices_problem: number;
  devices: ArubaDevice[];
  devices_problem?: ArubaDevice[];
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
  icon?: JSX.Element;
}

// Backup Alerts types
export interface BackupAlerts {
  [client: string]: BackupAlert;
}

export interface BackupAlert {
  Estado: string;
  FechaEnvio: string;
  Cuerpo: string;
  CuerpoTraducido?: string;
  GmailLink?: string;
}

// Tunnels types
export type TunnelStatus = 'healthy' | 'degraded' | 'down' | 'inactive' | 'unknown';

export interface Tunnel {
  id: string;
  name: string;
  status: TunnelStatus;
  connections: number;
  last_seen_at: string;
}

export interface TunnelsSummary {
  counts: Record<TunnelStatus, number>;
  tunnels: Tunnel[];
  total: number;
  last_poll: string;
}

// Dashboard Status Summary
export interface StatusSummary {
  critical: number;
  warning: number;
  operational: number;
}
