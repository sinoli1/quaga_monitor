import { ExternalLinkIcon } from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import { formatDistanceToNow, parseISO } from "date-fns";

interface UptimeRobotCardProps {
  clientName: string;
  monitorName: string;
  status: string;
  lastDown: string;
  url: string;
  statusUrl: string;
}

const UptimeRobotCard = ({
  clientName,
  monitorName,
  status,
  lastDown,
  url,
  statusUrl
}: UptimeRobotCardProps) => {
  // Format the last down time
  const formatLastDown = (lastDownTime: string) => {
    try {
      if (lastDownTime === 'Unknown') return 'Unknown';
      return formatDistanceToNow(parseISO(lastDownTime), { addSuffix: true });
    } catch (e) {
      return lastDownTime;
    }
  };

  // Determine status badge class
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Down':
        return 'status-error';
      case 'Unknown':
        return 'status-unknown';
      default:
        return 'status-warning';
    }
  };

  return (
    <DashboardCard>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium">{clientName}</h3>
        <div className={`status-badge ${getStatusClass(status)}`}>
          <span className={`status-badge-dot`}></span>
          {status}
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <p className="text-gray-400">
          <span className="font-medium text-white">Monitor:</span> {monitorName}
        </p>
        <p className="text-gray-400">
          <span className="font-medium text-white">Last down:</span> {formatLastDown(lastDown)}
        </p>
        <p className="text-gray-400 truncate">
          <span className="font-medium text-white">URL:</span> {url}
        </p>
      </div>
      <div className="mt-4 flex justify-end">
        <a
          href={statusUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:text-primary-light flex items-center"
        >
          View status
          <ExternalLinkIcon className="h-3 w-3 ml-1" />
        </a>
      </div>
    </DashboardCard>
  );
};

export default UptimeRobotCard;
