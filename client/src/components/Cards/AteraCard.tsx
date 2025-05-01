import { formatDistanceToNow, parseISO } from "date-fns";
import DashboardCard from "@/components/Dashboard/Card";

interface AteraCardProps {
  title: string;
  description: string;
  startTime: string;
  resolved: string | null;
  isMachineStatusUnknown: boolean;
}

const AteraCard = ({
  title,
  description,
  startTime,
  resolved,
  isMachineStatusUnknown
}: AteraCardProps) => {
  // Format time since the incident started
  const formatStartTime = (time: string) => {
    try {
      return formatDistanceToNow(parseISO(time), { addSuffix: true });
    } catch (e) {
      return time;
    }
  };

  // Calculate active time if not resolved
  const getActiveTime = (time: string) => {
    try {
      const start = parseISO(time);
      const now = new Date();
      const hours = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60));
      const minutes = Math.floor(((now.getTime() - start.getTime()) % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `Active for ${hours}h ${minutes}m`;
      } else {
        return `Active for ${minutes}m`;
      }
    } catch (e) {
      return "Active";
    }
  };

  return (
    <DashboardCard highlightBorder={isMachineStatusUnknown}>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium">{title}</h3>
        <div className={`status-badge ${isMachineStatusUnknown ? 'status-warning' : 'status-error'}`}>
          <span className="status-badge-dot"></span>
          {isMachineStatusUnknown ? 'Machine status unknown' : 'Alert'}
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <p className="text-gray-400">{description}</p>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">
            <span className="font-medium text-white">Started:</span> {formatStartTime(startTime)}
          </span>
          <span className={`${isMachineStatusUnknown ? 'text-yellow-400' : 'text-red-400'} font-medium`}>
            {!resolved && startTime ? getActiveTime(startTime) : "Resolved"}
          </span>
        </div>
      </div>
    </DashboardCard>
  );
};

export default AteraCard;
