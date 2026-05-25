import { ShieldCheck, Globe, CloudOff } from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import UptimeRobotCard from "@/components/Cards/UptimeRobotCard";
import { UptimeMonitor } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface UptimeRobotColumnProps {
  data: UptimeMonitor[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const UptimeRobotColumn = ({ data, isLoading, error }: UptimeRobotColumnProps) => {
  // Extraemos todos los monitores, Up y Down
  const allMonitors = data?.monitors?.flatMap(monitor => {
    const clientName = monitor.friendly_name;

    return Object.entries(monitor.monitors_id).map(([monitorId, details]) => ({
      clientName,
      monitorId,
      monitorName: details.friendly_name,
      status: details.status, // ej: 'Down' o 'Up'
      lastDown: details.incidents[0]?.last_down || 'Unknown',
      url: details.url,
      statusUrl: monitor.custom_url + '/' + monitorId,
    }));
  }) || [];

  const parseUptimeString = (time: string): number => {
    if (time === "Unknown") return Number.MAX_VALUE;
    const daysMatch = time.match(/(\d+)\s+days?/);
    const timeMatch = time.match(/(\d+):(\d+):(\d+)/);

    const days = daysMatch ? parseInt(daysMatch[1]) : 0;
    const hours = timeMatch ? parseInt(timeMatch[1]) : 0;
    const minutes = timeMatch ? parseInt(timeMatch[2]) : 0;

    return days * 24 * 60 + hours * 60 + minutes;
  };

  // Agrupamos para determinar redundancia (mismo Cliente/Sitio)
  const grouped: Record<string, typeof allMonitors> = {};
  allMonitors.forEach((m) => {
    const parts = m.monitorName.split(" - ");
    // Si tiene 3 o más partes: [Cliente] - [Sitio] - [ISP] -> Agrupamos por Cliente - Sitio
    // Si tiene 2 partes: [Cliente] - [ISP] -> Agrupamos por Cliente
    // Si tiene 1 parte: [Monitor] -> Grupo individual
    let key = parts[0];
    if (parts.length >= 3) {
      key = `${parts[0]} - ${parts[1]}`;
    } else if (parts.length === 2) {
      key = parts[0];
    }
    
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });

  // Determinamos criticidad: Es crítico solo si TODOS los ISPs de un grupo están caídos.
  // Si hay varios y al menos uno sigue UP, el caído se marca como Warning (Amarillo).
  const filteredMonitors = Object.values(grouped).flatMap(monitorsGroup => {
    const allDown = monitorsGroup.every(m => m.status === "Down");

    return monitorsGroup
      .filter(m => m.status === "Down")
      .map(m => ({
        ...m,
        isCritical: allDown,
      }));
  });

  filteredMonitors.sort((a, b) => {
    // Primero los críticos
    if (a.isCritical !== b.isCritical) {
      return a.isCritical ? -1 : 1;
    }

    // Si ambos son iguales en criticidad, ordenar por antigüedad (más reciente primero)
    const timeA = parseUptimeString(a.lastDown);
    const timeB = parseUptimeString(b.lastDown);
    return timeB - timeA; // menor tiempo = más reciente = más arriba
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <Globe className="w-6 h-6 text-blue-500 mr-2" />
          Uptime Robot
        </h2>
        {!isLoading && !error && (
          <div className="flex gap-2">
            {filteredMonitors.filter(m => m.isCritical).length > 0 && (
              <span className="text-sm text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                {filteredMonitors.filter(m => m.isCritical).length} sin internet
              </span>
            )}
            <span className="text-sm text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
              {filteredMonitors.filter(m => !m.isCritical).length} revisar
            </span>
          </div>
        )}
      </div>

      {isLoading && (
        <>
          <LoadingSkeleton />
          <LoadingSkeleton />
        </>
      )}

      {error && (
        <DashboardCard variant="critical">
          <div className="flex flex-col items-center text-center py-6">
            <CloudOff className="text-red-500 mb-3 h-14 w-14 animate-pulse" />
            <h3 className="text-lg font-semibold text-red-600">
              Error al conectar con UptimeRobot
            </h3>
            <p className="text-sm text-red-400 mt-1">
              No se pudieron cargar los datos de la API.
            </p>
          </div>
        </DashboardCard>

      )}

      {!isLoading && !error && filteredMonitors.length === 0 && (
        <EmptyState />
      )}

      {!isLoading && !error && filteredMonitors.length > 0 && (
        <>
          {filteredMonitors.map((monitor, index) => (
            <UptimeRobotCard
              key={`${monitor.monitorId}-${index}`}
              clientName={monitor.clientName}
              monitorName={monitor.monitorName}
              status={monitor.status}
              lastDown={monitor.lastDown}
              url={monitor.url}
              statusUrl={monitor.statusUrl}
              isCritical={monitor.isCritical}
            />
          ))}

          <DashboardCard className="p-2">
            <div className="text-center text-sm text-gray-500 font-medium">
              Incidentes totales: {filteredMonitors.length}
            </div>
          </DashboardCard>
        </>
      )}
    </div>
  );
};

const LoadingSkeleton = () => (
  <DashboardCard>
    <div className="space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  </DashboardCard>
);

const EmptyState = () => (
  <DashboardCard variant="success">
    <div className="flex flex-col items-center py-6">
      <ShieldCheck className="text-green-500 mb-4 h-12 w-12" />
      <p className="text-green-600 mb-1">Todos los monitores están operativos</p>
      <p className="text-xs text-green-500">No se detectaron incidentes de conectividad</p>
    </div>
  </DashboardCard>
);

export default UptimeRobotColumn;
