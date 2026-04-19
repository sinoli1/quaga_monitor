import React from 'react';
import RowLink from './RowLink';
import CorrelationPill from './CorrelationPill';
import ActiveIsps from './ActiveIsps';
import { Unplug } from 'lucide-react';
import { ArrowUpRightIcon } from './SvgIcons';

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
        {downIsps.map((isp, idx) => (
          <RowLink
            key={idx}
            href={isp.href}
            statusClass="down"
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
        {clientPageUrl && (
          <a className="card-link-foot" href={clientPageUrl}>
            Página del cliente
            <ArrowUpRightIcon size={10} />
          </a>
        )}
      </div>
    </div>
  );
};

export default UptimeCard;
