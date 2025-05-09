import DashboardCard from "@/components/Dashboard/Card";
import { formatDistanceToNow, parse } from "date-fns";
import { ArubaDevice } from "@/types";
import { WifiOff } from 'lucide-react';

interface ArubaCardProps {
  siteName: string;
  totalDevices: number;
  totalDevicesWithProblems: number;
  devices: ArubaDevice[];
}

const ArubaCard = ({ siteName, totalDevices, totalDevicesWithProblems, devices }: ArubaCardProps) => {
  const isCritical = totalDevicesWithProblems === totalDevices;

  return (
    <DashboardCard>
      <div className="flex justify-between items-start mb-3">
      <h3 className="font-large flex items-center gap-2 text-base text-white">
  <WifiOff className="w-5 h-5 text-red-300" />
  {siteName}
  <span className="text-sm text-gray-400 font-normal">
    | {totalDevicesWithProblems} dispositivos de {totalDevices}
  </span>
</h3>
        <div className={`status-badge ${isCritical ? 'status-error' : 'status-warning'}`}>
          <span className="status-badge-dot"></span>
          {isCritical ? 'Critical' : 'Partial'}
        </div>
      </div>

      <div className="space-y-3 text-sm">
        {devices
          .filter(device => device.status !== 'connected')
          .map((device, index) => (
            <div key={`${device.mac_address}-${index}`} className="space-y-1 border-l-2 border-red-500 pl-3">
              <p className="font-medium">{device.device_name} ({device.model})</p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <p className="text-gray-400">
                  <span className="font-medium text-white">IP:</span> {device.ip_address || "N/A"}
                </p>
                <p className="text-gray-400">
                  <span className="font-medium text-white">MAC:</span> {device.mac_address || "N/A"}
                </p>
                <p className="text-gray-400">
                  <span className="font-medium text-white">Last seen:</span> {formatLastSeen(device.last_communication_datetime)}
                </p>
                <p className="text-red-400 font-medium">
                  Offline for {formatOfflineTime(device.seconds_since_last_communication)}
                </p>
              </div>
            </div>
          ))}
      </div>
    </DashboardCard>
  );
};

// Format last seen time from dd/MM/yyyy HH:mm:ss
const formatLastSeen = (dateStr: string) => {
  try {
    const parsedDate = parse(dateStr, "dd/MM/yyyy HH:mm:ss", new Date());
    return formatDistanceToNow(parsedDate, { addSuffix: true });
  } catch (e) {
    return dateStr;
  }
};

const formatOfflineTime = (seconds: number) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  return `${days > 0 ? `${days}d ` : ''}${remainingHours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
};

export default ArubaCard;
