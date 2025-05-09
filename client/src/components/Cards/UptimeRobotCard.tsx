import {
  ExternalLinkIcon,
  Cable,
  ContactRound,
  ShieldAlert,
  Goal,
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

// Parsea texto tipo "9 days, 4:08:54" o "4:08:54" y devuelve días como número decimal
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

const formatLastDown = (lastDownTime: string) => {
  return lastDownTime === "Unknown" ? "Unknown" : lastDownTime;
};

// Componente individual
const UptimeRobotCard = ({
  clientName,
  monitorName,
  status,
  lastDown,
  url,
  statusUrl,
  isCritical,
}: UptimeRobotCardProps) => {
  const getStatusLabel = () => {
    return isCritical ? "Disconnet" : "Partial";
  };

  const getStatusClass = () => {
    return isCritical ? "status-error" : "status-warning";
  };

  const monitorId = statusUrl.split("/").pop();

  return (
    <DashboardCard>
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-white text-lg font-semibold flex items-center gap-2">
          <Cable className="w-5 h-5 text-orange-400" />
          {monitorName}
        </h3>
        <div className={`status-badge ${getStatusClass()}`}>
          <span className="status-badge-dot" />
          {getStatusLabel()}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-300">
          <ContactRound className="w-4 h-4 text-blue-200" />
          <span className="text-sm">Client:</span>
          <span className="text-white font-medium">{clientName}</span>
        </div>

        <div
          className={`flex items-center gap-2 ${
            isCritical ? "text-red-400" : "text-gray-300"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-blue-200" />
          <span className="text-sm">Monitor:</span>
          <span className="font-medium">
            <a
              href={`https://dashboard.uptimerobot.com/monitors/${monitorId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary-light"
            >
              ver en Uptime
            </a>
          </span>
        </div>

        <div className="flex items-center gap-2 text-gray-400 truncate">
          <Goal className="w-4 h-4 text-blue-200" />
          <span className="text-sm">Watching:</span>
          <span className="text-white font-medium">{url}</span>
        </div>
      </div>

      <div className="flex justify-between text-xs items-center mt-3">
        <span className="text-gray-400 inline-flex items-center gap-1">
          <span className="font-medium text-white">Started:</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getBadgeClass(
              lastDown
            )}`}
          >
            {formatLastDown(lastDown)}
          </span>
        </span>
        <span className="font-medium">
          <a
            href={statusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:text-primary-light flex items-center"
          >
            View Status Page
            <ExternalLinkIcon className="h-3 w-3 ml-1" />
          </a>
        </span>
      </div>
    </DashboardCard>
  );
};

// Componente lista
interface UptimeRobotListProps {
  data: UptimeRobotCardProps[];
}

export const UptimeRobotList = ({ data }: UptimeRobotListProps) => {
  const sortedData = [...data].sort((a, b) => {
    if (a.isCritical && !b.isCritical) return -1;
    if (!a.isCritical && b.isCritical) return 1;
    return 0;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedData.map((item, idx) => (
        <UptimeRobotCard key={idx} {...item} />
      ))}
    </div>
  );
};

export default UptimeRobotCard;
