import DashboardCard from "@/components/Dashboard/Card";
import { parse, differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";
import { ArubaDevice } from "@/types";
import { WifiOff, ClockAlert, ExternalLinkIcon } from "lucide-react";

interface ArubaCardProps {
  siteName: string;
  siteId: string;
  totalDevices: number;
  totalDevicesWithProblems: number;
  devices: ArubaDevice[];
}

const ArubaCard = ({
  siteName,
  siteId,
  totalDevices,
  totalDevicesWithProblems,
  devices,
}: ArubaCardProps) => {
  const isCritical = totalDevicesWithProblems === totalDevices;
  const portalUrl = `https://portal.instant-on.hpe.com/sites/${siteId}/overview`;

  return (
    <DashboardCard
      highlightBorder={isCritical}
      highlightColor="border-red-500 animate-glow-pulse rounded-lg"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-large flex items-center gap-2 text-base text-white">
          <WifiOff className={`w-5 h-5 ${isCritical ? "text-red-500" : "text-yellow-400"}`} />
          {siteName}
          <span className="text-sm text-gray-400 font-normal">
            | {totalDevicesWithProblems} de {totalDevices}
          </span>
        </h3>
        <div className={`status-badge ${isCritical ? "status-error animate-glow-pulse" : "status-warning"}`}>
          <span className="status-badge-dot"></span>
          {isCritical ? "Critico" : "Parcial"}
        </div>
      </div>

      <div className="space-y-3 text-sm">
        {devices
          .filter((device) => device.status !== "connected")
          .map((device, index) => (
            <div
              key={`${device.mac_address}-${index}`}
              className="space-y-1 border-l-2 border-red-500 pl-3"
            >
              <p className="font-medium">
                {device.device_name} ({device.model})
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <p className="text-gray-400">
                  <span className="font-medium text-white">IP:</span>{" "}
                  {device.ip_address || "N/A"}
                </p>
                <p className="text-gray-400">
                  <span className="font-medium text-white">MAC:</span>{" "}
                  {device.mac_address || "N/A"}
                </p>
                <p className="text-gray-400">
                  <span className="font-medium text-white">Ultima vez:</span>{" "}
                  {formatLastSeen(device.last_communication_datetime)}
                </p>
                <p className="text-red-400 font-medium">
                  Desconectado hace {formatOfflineTime(device.seconds_since_last_communication)}
                </p>
              </div>
            </div>
          ))}
      </div>

      <div className="flex justify-between items-center mt-3 text-xs">
        <span className="text-gray-400 inline-flex items-center gap-1">
          <ClockAlert className="w-4 h-4 text-blue-200" />
          <span className="font-medium text-gray">Caído desde:</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-500">
            {formatLastSeen(devices[0]?.last_communication_datetime)}
          </span>
        </span>
        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:text-primary-light flex items-center"
        >
          Ver en Aruba
          <ExternalLinkIcon className="h-3 w-3 ml-1" />
        </a>
      </div>
    </DashboardCard>
  );
};

// Utilidad: Formato compacto tipo "hace 2h"
const formatLastSeen = (dateStr: string) => {
  try {
    const parsed = parse(dateStr, "dd/MM/yyyy HH:mm:ss", new Date());
    const now = new Date();
    const minutes = differenceInMinutes(now, parsed);
    const hours = differenceInHours(now, parsed);
    const days = differenceInDays(now, parsed);

    if (minutes < 60) return `hace ${minutes}m`;
    if (hours < 24) return `hace ${hours}h`;
    return `hace ${days}d`;
  } catch {
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
  return `${days > 0 ? `${days}d ` : ""}${remainingHours}h${
    minutes > 0 ? ` ${minutes}m` : ""
  }`;
};

export default ArubaCard;
