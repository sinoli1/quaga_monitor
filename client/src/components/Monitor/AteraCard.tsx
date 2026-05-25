import React from 'react';
import RowLink from './RowLink';
import CorrelationPill from './CorrelationPill';
import TicketButton from './TicketButton';
import { ServerCrashIcon, MemoryIcon, DiskIcon } from './SvgIcons';

export interface AteraAlertRow {
  type: 'offline' | 'memory' | 'disk';
  deviceName: string;
  href: string;
  meta: string[];
  duration: string;
  diskBar?: { percent: number; fillClass: string };
}

export interface AteraCardProps {
  initials: string;
  title: string;
  subtitle: string;
  severity: 'critical' | 'orange' | 'warning';
  badgeText: string;
  alerts: AteraAlertRow[];
  correlation?: string;
  reportedLabel: string;
  reportedTime: string;
}

const statusClassMap = {
  offline: 'down' as const,
  memory: 'orange' as const,
  disk: 'warn' as const,
};

const iconMap = {
  offline: <ServerCrashIcon />,
  memory: <MemoryIcon />,
  disk: <DiskIcon />,
};

const extractDeviceName = (deviceName: string): string => {
  const sep = deviceName.indexOf(' · ');
  return sep >= 0 ? deviceName.slice(0, sep) : deviceName;
};

const formatResourceDesc = (alert: AteraAlertRow): string => {
  const device = extractDeviceName(alert.deviceName);
  if (alert.type === 'disk') {
    const m = alert.deviceName.match(/DISCO\s+([A-Z]:)\s+(\d+)%/i);
    return m ? `${device} con disco ${m[1].replace(':', '')} al ${m[2]}%` : `${device} con disco lleno`;
  }
  const m = alert.deviceName.match(/MEMORIA\s+(\d+)%/i);
  const pct = m ? m[1] : (alert.diskBar?.percent?.toString() ?? null);
  return pct ? `${device} con memoria al ${pct}%` : `${device} con memoria alta`;
};

const joinList = (items: string[]): string => {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} y ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
};

const buildSubject = (title: string, alerts: AteraAlertRow[]): string => {
  const offline = alerts.filter(a => a.type === 'offline');
  const resources = alerts.filter(a => a.type !== 'offline');

  // Offline domina — crítico
  if (offline.length === 1) {
    return `Monitoreo: ${extractDeviceName(offline[0].deviceName)} reportado offline hace ${offline[0].duration} - 🔴 CRÍTICO`;
  }
  if (offline.length === 2) {
    return `Monitoreo: ${extractDeviceName(offline[0].deviceName)} y ${extractDeviceName(offline[1].deviceName)} reportados offline - 🔴 CRÍTICO`;
  }
  if (offline.length > 2) {
    return `Monitoreo: ${offline.length} servidores offline en ${title} - 🔴 CRÍTICO`;
  }

  // Alertas de recursos: cada dispositivo con su incidencia específica
  if (resources.length > 0) {
    return `Monitoreo: ${joinList(resources.map(formatResourceDesc))} - 🟡 ADVERTENCIA`;
  }

  return `Monitoreo: ${title} - 🟡 ADVERTENCIA`;
};

const AteraCard = ({
  initials,
  title,
  subtitle,
  severity,
  badgeText,
  alerts,
  correlation,
  reportedLabel,
  reportedTime,
}: AteraCardProps) => {
  const subject = buildSubject(title, alerts);

  return (
    <div className={`card ${severity}`}>
      <div className="card-head">
        <div className="card-identity">
          <div className="avatar">{initials}</div>
          <div className="card-name">
            <div className="card-title">{title}</div>
            <div className="card-subtitle">{subtitle}</div>
          </div>
        </div>
        <div className={`card-badge ${severity}`}>
          {severity === 'critical' && <span className="pulse"></span>}
          {badgeText}
        </div>
      </div>

      <div className="row-list">
        {alerts.map((alert, idx) => (
          <RowLink
            key={idx}
            href={alert.href}
            statusClass={statusClassMap[alert.type]}
            statusIcon={iconMap[alert.type]}
            title={alert.deviceName}
            meta={alert.meta}
            duration={alert.duration}
            diskBar={alert.diskBar}
          />
        ))}
      </div>

      {correlation && <CorrelationPill message={correlation} />}

      <div className="card-foot">
        <span className="reported">{reportedLabel} <strong>{reportedTime}</strong></span>
        <TicketButton subject={subject} />
      </div>
    </div>
  );
};

export default AteraCard;
