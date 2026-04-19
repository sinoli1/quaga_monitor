import { ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BackupAlertCardProps {
  clientName: string;
  status: string;
  sentDate: string;
  summary: string;
  fullBody: string;
  gmailLink?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const BackupAlertCard = ({
  clientName,
  status,
  sentDate,
  summary,
  fullBody,
  gmailLink,
  isExpanded,
  onToggleExpand,
}: BackupAlertCardProps) => {

  const isFailed = status.toLowerCase().includes("failed");
  const severityClass = isFailed ? "critical" : "warning";
  
  const formatSentDate = (dateString: string) => {
    try {
      const cleanDate = dateString.replace(/\s*\(.*?\)$/, "");
      const date = new Date(cleanDate);
      return format(date, "dd/MM HH:mm", { locale: es });
    } catch {
      return dateString;
    }
  };

  return (
    <div className={`backup-item ${severityClass}`}>
      <div className="backup-head" onClick={onToggleExpand}>
        <div className="backup-id">
          <div className="backup-tech-icon">
            {clientName.substring(0, 2).toUpperCase()}
          </div>
          <div className="backup-title-wrap">
            <div className="backup-title">{clientName.toUpperCase()}</div>
            <div className="backup-subtitle">
              Fallo de respaldo
            </div>
          </div>
        </div>
        <div className="backup-date">
          {formatSentDate(sentDate)}
        </div>
      </div>

      <div className={`backup-body ${isExpanded ? '' : 'collapsed'}`}>
        {isExpanded ? fullBody : summary}
      </div>

      <div className="backup-foot">
        <span className="sev-tag" style={{
          fontSize: '9.5px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          padding: '3px 8px',
          borderRadius: '4px',
          fontFamily: "'JetBrains Mono', monospace",
          background: isFailed ? 'var(--critical-bg)' : 'var(--warning-bg)',
          color: isFailed ? 'var(--critical-soft)' : 'var(--warning-soft)',
          border: `1px solid ${isFailed ? 'var(--critical-border)' : 'var(--warning-border)'}`
        }}>
          {isFailed ? 'FAILED' : 'WARNING'}
        </span>

        {gmailLink && (
          <a href={gmailLink} target="_blank" rel="noopener noreferrer" className="backup-link" onClick={(e) => e.stopPropagation()}>
            Ver correo
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
};

export default BackupAlertCard;