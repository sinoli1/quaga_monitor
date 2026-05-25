import { ExternalLink, Clock } from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
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

const parseDate = (dateString: string): Date | null => {
  try {
    const clean = dateString.replace(/\s*\(.*?\)$/, "");
    const d = new Date(clean);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

const formatAbsLabel = (date: Date): string => {
  if (isToday(date)) return `Hoy ${format(date, "HH:mm")}`;
  if (isYesterday(date)) return `Ayer ${format(date, "HH:mm")}`;
  return format(date, "EEE dd/MM · HH:mm", { locale: es });
};

// Short relative time: "hace 3h", "hace 45m", "hace 2d"
const formatRelTime = (date: Date): string => {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  return `hace ${Math.floor(hours / 24)}d`;
};

const extractSource = (name: string): string => {
  const parts = name.split(/\s*[-–]\s*/);
  return parts.length >= 2 ? parts[parts.length - 1].trim() : "Backup";
};

const PREVIEW_LEN = 320;
const makePreview = (body: string): string => {
  const clean = body.trim().replace(/\n{3,}/g, "\n\n");
  if (clean.length <= PREVIEW_LEN) return clean;
  const cut = clean.lastIndexOf(" ", PREVIEW_LEN);
  return clean.substring(0, cut > 0 ? cut : PREVIEW_LEN) + "…";
};

const BackupAlertCard = ({
  clientName,
  status,
  sentDate,
  fullBody,
  gmailLink,
  isExpanded,
  onToggleExpand,
}: BackupAlertCardProps) => {
  const isFailed = status.toLowerCase().includes("failed");
  const severityClass = isFailed ? "critical" : "warning";

  const date = parseDate(sentDate);
  const absLabel = date ? formatAbsLabel(date) : sentDate;
  const relLabel = date ? formatRelTime(date) : "";
  const source = extractSource(clientName);
  const preview = makePreview(fullBody);

  return (
    <div className={`backup-item ${severityClass}`}>
      <div className="backup-head">
        <div className="backup-id">
          <div className="backup-tech-icon">
            {clientName.substring(0, 2).toUpperCase()}
          </div>
          <div className="backup-title-wrap">
            <div className="backup-title">{clientName.toUpperCase()}</div>
            <div className="backup-subtitle">
              <span className="backup-subtitle-full">Fallo de respaldo · {source}</span>
              <span className="backup-subtitle-short">Fallo de {source}</span>
            </div>
          </div>
        </div>
        <div className="backup-date">
          <div className="backup-date-main">
            <Clock size={11} />
            <span className="backup-date-abs">{absLabel}</span>
          </div>
          {relLabel && <span className="backup-date-rel">{relLabel}</span>}
        </div>
      </div>

      <div
        className={`backup-body ${isExpanded ? "expanded" : "collapsed"}`}
        onClick={onToggleExpand}
      >
        {isExpanded ? fullBody.trim() : preview}
      </div>

      <div className="backup-foot">
        <span className="sev-tag" style={{
          fontSize: "9.5px",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          padding: "3px 8px",
          borderRadius: "4px",
          fontFamily: "'JetBrains Mono', monospace",
          background: isFailed ? "var(--critical-bg)" : "var(--warning-bg)",
          color: isFailed ? "var(--critical-soft)" : "var(--warning-soft)",
          border: `1px solid ${isFailed ? "var(--critical-border)" : "var(--warning-border)"}`,
        }}>
          {isFailed ? "FAILED" : "WARNING"}
        </span>

        {gmailLink && (
          <a
            href={gmailLink}
            target="_blank"
            rel="noopener noreferrer"
            className="backup-link"
            onClick={(e) => e.stopPropagation()}
          >
            Ver correo
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
};

export default BackupAlertCard;
