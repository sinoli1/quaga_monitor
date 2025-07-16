import { TriangleAlert, Globe } from "lucide-react";
import { ShieldCheck } from "lucide-react";
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
  
  // Agrupamos por client-site (primeras 2 partes de monitorName)
  const grouped: Record<string, typeof allMonitors> = {};
  allMonitors.forEach((m) => {
    const [client, site] = m.monitorName.split(" - ");
    const key = `${client} - ${site}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });

  // Por cada grupo determinamos si todos los ISP están caídos (status === "Down")
  // Luego filtramos solo los que están caídos y les asignamos isCritical según grupo
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
          <span className="text-sm text-white bg-lime-500/20 px-2 py-0.5 rounded-full">
            {filteredMonitors.length} {filteredMonitors.length === 1 ? 'incidente' : 'incidentes'}
          </span>
        )}
      </div>

      {isLoading && (
        <>
          <LoadingSkeleton />
          <LoadingSkeleton />
        </>
      )}

      {error && (
        <DashboardCard>
          <div className="flex items-center text-destructive gap-2">
            <TriangleAlert className="h-5 w-5" />
            <span>Fallo al cargar los datos de Uptime Robot</span>
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
  <div className="border border-green-500 rounded-2xl overflow-hidden">
    <DashboardCard>
      <div className="flex flex-col items-center py-6">
        <ShieldCheck className="text-green-500 mb-4 h-12 w-12" />
        <p className="text-green-600 mb-1">Todos los monitores están operativos</p>
        <p className="text-xs text-green-500">No se detectaron incidentes de conectividad</p>
      </div>
    </DashboardCard>
  </div>
);

export default UptimeRobotColumn;
