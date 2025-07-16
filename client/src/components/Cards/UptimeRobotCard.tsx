import {
  ExternalLinkIcon,
  Cable,
  MonitorX,
  LayoutDashboard,
  ScanEye,
  ClockAlert
} from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";

interface UptimeRobotCardProps {
  clientName: string;
  monitorName: string;
  status: string;
  lastDown: string;
  url: string;
  statusUrl: string;
  isCritical: boolean;
}

const parseUptimeString = (time: string): number => {
  if (time === "Unknown") return 999;
  const daysMatch = time.match(/(\d+)\s+days?/);
  const timeMatch = time.match(/(\d+):(\d+):(\d+)/);

  const days = daysMatch ? parseInt(daysMatch[1]) : 0;
  const hours = timeMatch ? parseInt(timeMatch[1]) : 0;
  const minutes = timeMatch ? parseInt(timeMatch[2]) : 0;

  return days + hours / 24 + minutes / 1440;
};

const getBadgeClass = (time: string) => {
  try {
    const totalDays = parseUptimeString(time);
    if (totalDays < 1) return "bg-blue-500/20 text-blue-400";
    if (totalDays < 2) return "bg-yellow-500/20 text-yellow-600";
    return "bg-red-500/20 text-red-500";
  } catch {
    return "bg-gray-500/20 text-gray-400";
  }
};

const formatLastDown = (time: string) => {
  if (time === "Unknown") return "Desconocido";

  const daysMatch = time.match(/(\d+)\s+days?/);
  const timeMatch = time.match(/(\d+):(\d+):(\d+)/);

  const d = daysMatch ? `${daysMatch[1]}d` : "";
  const h = timeMatch ? `${parseInt(timeMatch[1])}h` : "";
  const m = timeMatch ? `${parseInt(timeMatch[2])}m` : "";

  return [d, h, m].filter(Boolean).join(" ");
};

const UptimeRobotCard = ({
  clientName,
  monitorName,
  status,
  lastDown,
  url,
  statusUrl,
  isCritical,
}: UptimeRobotCardProps) => {
  const getStatusLabel = () => isCritical ? "Desconectado" : "Parcial";
  const getStatusClass = () => isCritical ? "status-error" : "status-warning";
  const monitorId = statusUrl.split("/").pop();

  const maxLength = 50;
  const truncatedUrl = url.length > maxLength ? url.slice(0, maxLength) + '...' : url;

  return (
    <DashboardCard
      highlightBorder={isCritical}
      highlightColor="border-red-500 animate-glow-pulse rounded-lg"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-white text-lg font-semibold flex items-center gap-2">
          <Cable className={`w-5 h-5 ${isCritical ? "text-red-500" : "text-orange-400"}`} />
          {clientName}
        </h3>
        <div className={`status-badge ${getStatusClass()}`}>
          <span className={`status-badge-dot ${isCritical ? "animate-glow-pulse" : ""}`} />
          {getStatusLabel()}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <MonitorX className="w-4 h-4 text-blue-200" />
          <span className="text-sm">Servicio:</span>
          <span className="text-white font-medium truncate">{monitorName}</span>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <LayoutDashboard className="w-4 h-4 text-blue-200" />
          <span className="text-sm">Más detalle:</span>
          <a
            href={`https://dashboard.uptimerobot.com/monitors/${monitorId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary-light flex items-center gap-1"
          >
            ir al dashboard
            <ExternalLinkIcon className="h-3 w-3" />
          </a>
        </div>

        <div className="flex items-center gap-2 text-gray-400">
          <ScanEye className="w-4 h-4 text-blue-200" />
          <span className="text-sm">Monitoreando:</span>
          <span className="text-white font-medium truncate max-w-[200px] sm:max-w-[250px]">{truncatedUrl}</span>
        </div>
      </div>

      <div className="flex justify-between flex-wrap gap-y-2 text-xs items-center mt-3">
        <span className="text-gray-400 inline-flex items-center gap-1">
          <ClockAlert className="w-4 h-4 text-blue-200" />
          <span className="font-medium text-gray">Última caída:</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getBadgeClass(lastDown)}`}>
            {formatLastDown(lastDown)}
          </span>
        </span>
        <a
          href={statusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:text-primary-light flex items-center gap-1"
        >
          Página de estado
          <ExternalLinkIcon className="h-3 w-3" />
        </a>
      </div>
    </DashboardCard>
  );
};

export default UptimeRobotCard;
