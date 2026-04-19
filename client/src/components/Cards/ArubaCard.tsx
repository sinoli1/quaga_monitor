import DashboardCard from "@/components/Dashboard/Card";
import { parse, differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";
import { ArubaDevice } from "@/types";
import { WifiOff, ClockAlert, ExternalLinkIcon, Globe, Monitor, Wifi } from "lucide-react";
import { CSSProperties } from "react";

interface ArubaCardProps {
  siteName: string;
  siteId: string;
  totalDevices: number;
  totalDevicesWithProblems: number;
  devices: ArubaDevice[];
  logo?: string | null;
}

// --- Clases de Color Simplificadas para Priorizar Alertas ---
const NEUTRAL_BADGE = "bg-gray-700/50 text-gray-300 border border-gray-600";
const WARNING_BADGE_CLASS = "bg-yellow-800/20 text-yellow-400 border border-yellow-800"; // Advertencia: Amarillo
const CRITICAL_BADGE_CLASS = "bg-red-800/20 text-red-400 border border-red-800"; // Crítico: Rojo
// -----------------------------------------------------------

const ArubaCard = ({
  siteName,
  siteId,
  totalDevices,
  totalDevicesWithProblems,
  devices,
  logo,
}: ArubaCardProps) => {
  const isCritical = totalDevicesWithProblems === totalDevices;
  const portalUrl = `https://portal.instant-on.hpe.com/sites/${siteId}/overview`;

  const getInitials = (name?: string): string => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // 🚨 Genera degradado basado en isCritical 🚨
  const getInitialsBackgroundStyle = (isCritical: boolean): CSSProperties => {
    if (isCritical) {
      // Degradado CRÍTICO (Rojo/Borgoña)
      return {
        background: `linear-gradient(135deg, #ef4444, #b91c1c)`,
      };
    } else {
      // Degradado ADVERTENCIA (Amarillo/Naranja) - Para Aruba "con problemas" es amarillo
      return {
        background: `linear-gradient(135deg, #f59e0b, #d97706)`,
      };
    }
  };

  // 🚨 Genera borde basado en isCritical 🚨
  const getInitialsBorderStyle = (isCritical: boolean): CSSProperties => {
    if (isCritical) {
      // Borde CRÍTICO
      return { borderColor: `#f87171` };
    } else {
      // Borde ADVERTENCIA
      return { borderColor: `#fbbf24` };
    }
  };

  const renderSiteLogo = () => {
    const borderStyle = getInitialsBorderStyle(isCritical);

    if (logo) {
      return (
        <img
          src={logo}
          alt={siteName}
          className="w-10 h-10 shrink-0 rounded-full object-contain border-2 bg-white p-0.5"
          style={borderStyle}
        />
      );
    }

    const initials = getInitials(siteName);
    const bgStyle = getInitialsBackgroundStyle(isCritical);

    return (
      <div
        className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white border-2"
        style={{ ...bgStyle, ...borderStyle }}
      >
        {initials}
      </div>
    );
  };

  const formatLastSeen = (dateStr: string) => {
    try {
      const parsed = parse(dateStr, "dd/MM/yyyy HH:mm:ss", new Date());
      const now = new Date();
      const minutes = differenceInMinutes(now, parsed);
      const hours = differenceInHours(now, parsed);
      const days = differenceInDays(now, parsed);

      if (minutes < 60) return `${minutes}m atrás`;
      if (hours < 24) return `${hours}h atrás`;
      return `${days}d atrás`;
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
    return `${days > 0 ? `${days}d ` : ""}${remainingHours}h${minutes > 0 ? ` ${minutes}m` : ""
      }`;
  };

  const getBadgeClass = (dateStr: string) => {
    try {
      const parsed = parse(dateStr, "dd/MM/yyyy HH:mm:ss", new Date());
      const days = differenceInDays(new Date(), parsed);
      const hours = differenceInHours(new Date(), parsed);

      if (hours < 24) return "bg-blue-800/20 text-blue-400";
      if (days <= 2) return "bg-yellow-800/20 text-yellow-400";
      // if (days <= 6) return "bg-orange-800/20 text-orange-400"; // Unificar con lógica de otros si se desea, pero mantengo la lógica de colores de cards anteriores para antigüedad
      return "bg-red-800/20 text-red-400";
    } catch {
      return "bg-gray-500/20 text-gray-400";
    }
  };

  const offlineDevices = devices.filter((device) => device.status !== "connected");
  const lastDeviceSeen = offlineDevices[0]?.last_communication_datetime;

  // Parsing cliente - site
  const [cliente, site] = (siteName || "").split(" - ");

  return (
    <DashboardCard variant={isCritical ? "critical" : "warning"} className="min-h-[250px] flex flex-col">
      {/* HEADER */}
      <header className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          {renderSiteLogo()}
          <div className="flex flex-col">
            <h3 className="text-base font-bold text-white leading-tight">
              {(cliente || siteName).toUpperCase()}
            </h3>
            {site && (
              <p className={`text-xs font-medium ${isCritical ? "text-red-400" : "text-yellow-400"}`}>
                {site}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-end">
          <div
            className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1.5 font-semibold ${isCritical
              ? `${CRITICAL_BADGE_CLASS} animate-glow-pulse`
              : WARNING_BADGE_CLASS
              }`}
          >
            {isCritical ? (
              <WifiOff className="w-3.5 h-3.5" />
            ) : (
              <Wifi className="w-3.5 h-3.5" />
            )}
            <span>{totalDevicesWithProblems} de {totalDevices}</span>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL (Flex-1 para ocupar espacio y empujar footer) */}
      <div className="flex-1 flex flex-col justify-between">
        <div className="mb-4">
          <div className="flex flex-wrap gap-3">
            {offlineDevices.map((device, index) => (
              <div
                key={`${device.mac_address}-${index}`}
                className={`flex flex-col border-l-2 pl-3 min-w-[140px] max-w-[200px] ${isCritical ? "border-red-500" : "border-yellow-500"}`}
              >
                <p className="font-semibold text-white truncate">{device.device_name}</p>
                <p className="text-gray-400 text-xs">{device.model}</p>
              </div>
            ))}
          </div>
        </div>

        {/* INFO DEL DISPOSITIVO (IP y MAC) - NEUTRALIZADOS */}
        <div className="flex items-center gap-2 mb-3 overflow-hidden flex-nowrap">
          {offlineDevices[0]?.ip_address && (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs shrink-0 ${NEUTRAL_BADGE}`}>
              <Globe className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-gray-300 font-mono text-xs truncate">
                {offlineDevices[0].ip_address}
              </span>
            </div>
          )}
          {offlineDevices[0]?.mac_address && (
            <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs shrink-0 ${NEUTRAL_BADGE}`}>
              <Monitor className="w-3 h-3 text-gray-400 shrink-0" />
              <span className="text-gray-300 font-mono text-xs">
                {offlineDevices[0].mac_address}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="pt-3 border-t border-gray-700/50 flex justify-between items-center flex-wrap gap-4">
        <div className="inline-flex items-center gap-2 text-xs bg-gray-700/30 rounded-full py-0.5 pr-2 pl-1 text-gray-300">
          <ClockAlert className="w-3.5 h-3.5 text-gray-400" />
          <span>Reportado:</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getBadgeClass(lastDeviceSeen || '')}`}>
            {lastDeviceSeen ? formatOfflineTime(offlineDevices[0]?.seconds_since_last_communication || 0) : "N/A"}
          </span>
        </div>

        <a
          href={portalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-700/50 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition-colors text-xs"
        >
          Ver en Aruba
          <ExternalLinkIcon className="h-3 w-3" />
        </a>
      </footer>
    </DashboardCard>
  );
};

export const isArubaCardCritical = (totalDevices: number, totalDevicesWithProblems: number) => {
  return totalDevicesWithProblems === totalDevices;
};

export default ArubaCard;