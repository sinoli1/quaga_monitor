import React from 'react';
import RowLink from './RowLink';
import CorrelationPill from './CorrelationPill';
import ActiveIsps from './ActiveIsps';
import TicketButton from './TicketButton';
import { Unplug } from 'lucide-react';

export interface UptimeIsp {
  name: string;
  tag?: string;
  tagClass?: string;
  href: string;
  hostname: string;
  type: string;
  duration: string;
}

export interface UptimeCardProps {
  initials: string;
  title: string;
  subtitle: string;
  severity: 'critical' | 'warning';
  badgeText: string;
  downIsps: UptimeIsp[];
  activeIsps?: { count: number; list: string[] };
  correlation?: string;
  reportedLabel: string;
  reportedTime: string;
  clientPageUrl?: string;
}

const buildSubject = (title: string, severity: 'critical' | 'warning', downIsps: UptimeIsp[]): string => {
  const emoji = severity === 'critical' ? '🔴' : '🟡';
  const level = severity === 'critical' ? 'CRÍTICO' : 'ADVERTENCIA';

  if (downIsps.length === 1) {
    return `Monitoreo: ${downIsps[0].name} caído en ${title} hace ${downIsps[0].duration} - ${emoji} ${level}`;
  }
  if (downIsps.length === 2) {
    return `Monitoreo: ${downIsps[0].name} y ${downIsps[1].name} caídos en ${title} - ${emoji} ${level}`;
  }
  return `Monitoreo: ${downIsps.length} ISPs caídos en ${title} - ${emoji} ${level}`;
};

const UptimeCard = ({
  initials,
  title,
  subtitle,
  severity,
  badgeText,
  downIsps,
  activeIsps,
  correlation,
  reportedLabel,
  reportedTime,
  clientPageUrl,
}: UptimeCardProps) => {
  const subject = buildSubject(title, severity, downIsps);

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
        <a
          href={clientPageUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className={`card-badge card-badge-link ${severity}`}
        >
          {severity === 'critical' && <span className="pulse"></span>}
          {badgeText}
        </a>
      </div>

      <div className="row-list">
        {downIsps.map((isp, idx) => (
          <RowLink
            key={idx}
            href={isp.href}
            statusClass={severity === 'critical' ? 'down' : 'warn'}
            statusIcon={<Unplug size={16} strokeWidth={2.5} />}
            title={isp.name}
            titleTag={isp.tag}
            titleTagClass={isp.tagClass || 'tag-inline'}
            meta={[isp.hostname, isp.type]}
            duration={isp.duration}
          />
        ))}
      </div>

      {activeIsps && (
        <ActiveIsps count={activeIsps.count} list={activeIsps.list} />
      )}

      {correlation && <CorrelationPill message={correlation} />}

      <div className="card-foot">
        <span className="reported">{reportedLabel} <strong>{reportedTime}</strong></span>
        <TicketButton subject={subject} />
      </div>
    </div>
  );
};

export default UptimeCard;
