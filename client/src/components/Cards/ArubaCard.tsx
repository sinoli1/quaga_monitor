import DashboardCard from "@/components/Dashboard/Card";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ArubaDevice } from "@/types";

interface ArubaCardProps {
  siteName: string;
  totalDevices: number;
  totalDevicesWithProblems: number;
  devices: ArubaDevice[];
}

const ArubaCard = ({ siteName, totalDevices, totalDevicesWithProblems, devices }: ArubaCardProps) => {
  // Determine if the site is in critical state (all devices down)
  const isCritical = totalDevicesWithProblems === totalDevices;

  return (
    <DashboardCard>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium">{siteName} | {totalDevicesWithProblems}/{totalDevices}</h3>
        <div className={`status-badge ${isCritical ? 'status-error' : 'status-warning'}`}>
          <span className="status-badge-dot"></span>
          {isCritical ? 'Critical' : 'Partial'}
        </div>
      </div>
      
      <div className="space-y-3 text-sm">
        {devices
          .filter(device => device.status !== 'connected')
          .map((device, index) => (
            <div key={`${device.mac}-${index}`} className="space-y-1 border-l-2 border-red-500 pl-3">
              <p className="font-medium">{device.device_name} ({device.model})</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <p className="text-gray-400"><span className="font-medium text-white">IP:</span> {device.ip}</p>
                <p className="text-gray-400"><span className="font-medium text-white">MAC:</span> {device.mac}</p>
                <p className="text-gray-400">
                  <span className="font-medium text-white">Last seen:</span> {formatLastSeen(device.last_seen)}
                </p>
                <p className="text-red-400 font-medium">Offline for {formatOfflineTime(device.seconds_offline)}</p>
              </div>
            </div>
          ))}
      </div>
    </DashboardCard>
  );
};

// Format the last seen time
const formatLastSeen = (lastSeen: string) => {
  try {
    return formatDistanceToNow(parseISO(lastSeen), { addSuffix: true });
  } catch (e) {
    return lastSeen;
  }
};

// Format the offline time
const formatOfflineTime = (seconds: number) => {
  if (seconds < 60) {
    return `${seconds}s`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
  }
};

export default ArubaCard;
