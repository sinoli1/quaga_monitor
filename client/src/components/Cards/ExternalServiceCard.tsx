import { ServiceStatus } from "@/types";

interface ExternalServiceCardProps {
  service: ServiceStatus;
}

const ExternalServiceCard = ({ service }: ExternalServiceCardProps) => {
  const isOperational = service.status === "Up";
  const severityClass = isOperational ? '' : 'down';

  return (
    <a className={`svc ${severityClass}`} href={service.statusUrl} target="_blank" rel="noopener noreferrer">
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {service.icon}
      </div>
      <div className="svc-body">
        <div className="svc-name">{service.name}</div>
      </div>
      
      <div style={{
          fontSize: '9.5px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          padding: '3px 8px',
          borderRadius: '4px',
          fontFamily: "'JetBrains Mono', monospace",
          background: isOperational ? 'var(--ok-bg)' : 'var(--critical-bg)',
          color: isOperational ? 'var(--ok-soft)' : 'var(--critical-soft)',
          border: `1px solid ${isOperational ? 'var(--ok-border)' : 'var(--critical-border)'}`,
          flexShrink: 0
      }}>
        {isOperational ? 'UP' : 'DOWN'}
      </div>
    </a>
  );
};

export default ExternalServiceCard;
