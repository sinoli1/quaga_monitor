import React, { useState } from 'react';
import RowLink from './RowLink';
import CorrelationPill from './CorrelationPill';
import ShowMore from './ShowMore';
import { SwitchIcon, WifiIcon } from './SvgIcons';

export interface ArubaDeviceRow {
  name: string;
  model: string;
  ip: string;
  duration: string;
  href: string;
  type: 'switch' | 'ap';
}

export interface ArubaCardProps {
  initials: string;
  title: string;
  subtitle: string;
  severity: 'critical' | 'warning';
  badgeText: string;
  devices: ArubaDeviceRow[];
  maxVisible?: number;
  correlation?: string;
  reportedLabel: string;
  reportedTime: string;
}

const deviceIconMap = {
  switch: <SwitchIcon />,
  ap: <WifiIcon />,
};

const ArubaCard = ({
  initials,
  title,
  subtitle,
  severity,
  badgeText,
  devices,
  maxVisible = 3,
  correlation,
  reportedLabel,
  reportedTime,
}: ArubaCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const visibleDevices = expanded ? devices : devices.slice(0, maxVisible);
  const hiddenCount = devices.length - maxVisible;

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
        {visibleDevices.map((device, idx) => (
          <RowLink
            key={idx}
            href={device.href}
            statusClass={severity === 'critical' ? 'down' : 'warn'}
            statusIcon={deviceIconMap[device.type]}
            title={device.name}
            meta={[device.model, device.ip]}
            duration={device.duration}
          />
        ))}
      </div>

      {!expanded && hiddenCount > 0 && (
        <div className="show-more" onClick={() => setExpanded(true)}>
          + {hiddenCount} dispositivos más caídos
        </div>
      )}

      {correlation && <CorrelationPill message={correlation} />}

      <div className="card-foot">
        <span className="reported">{reportedLabel} <strong>{reportedTime}</strong></span>
      </div>
    </div>
  );
};

export default ArubaCard;
