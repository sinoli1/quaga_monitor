import React from 'react';
import RowLink from './RowLink';
import CorrelationPill from './CorrelationPill';
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
      </div>
    </div>
  );
};

export default AteraCard;
