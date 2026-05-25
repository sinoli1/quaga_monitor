import { SiCloudflare } from "react-icons/si";
import { Tunnel } from "@/types";

interface TunnelCardProps {
  tunnel: Tunnel;
}

const TunnelCard = ({ tunnel }: TunnelCardProps) => {
  const isDown = tunnel.status === 'down';
  const severityClass = isDown ? 'down' : 'warn';
  const badgeText = isDown ? 'Caído' : 'Degradado';

  return (
    <div className={`svc ${severityClass}`}>
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SiCloudflare className="text-lg text-red-300 mr-2 w-5 h-5" />
      </div>
      <div className="svc-body">
        <div className="svc-name">{tunnel.name}</div>
      </div>

      <div style={{
          fontSize: '9.5px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          padding: '3px 8px',
          borderRadius: '4px',
          fontFamily: "'JetBrains Mono', monospace",
          background: isDown ? 'var(--critical-bg)' : 'var(--warning-bg)',
          color: isDown ? 'var(--critical-soft)' : 'var(--warning-soft)',
          border: `1px solid ${isDown ? 'var(--critical-border)' : 'var(--warning-border)'}`,
          flexShrink: 0
      }}>
        {badgeText}
      </div>
    </div>
  );
};

export default TunnelCard;
