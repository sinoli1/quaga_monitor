import { TriangleAlert, ArrowRightIcon, Globe } from "lucide-react";
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
  // Filtrar monitores con estado Down
  const filteredMonitors = data?.monitors?.flatMap(monitor => {
    const clientName = monitor.friendly_name;
    const isCritical = monitor.monitor_down === monitor.monitor_total;

    return Object.entries(monitor.monitors_id)
      .filter(([_, details]) => ['Down'].includes(details.status))
      .map(([monitorId, details]) => ({
        clientName,
        monitorId,
        monitorName: details.friendly_name,
        status: details.status,
        lastDown: details.incidents[0]?.last_down || 'Unknown',
        url: details.url,
        statusUrl: monitor.custom_url + '/' + monitorId,
        isCritical
      }));
  }) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <Globe className="w-6 h-6 text-blue-500 mr-2" />
          Uptime Robot
        </h2>
        {!isLoading && !error && (
          <span className="text-sm text-white bg-lime-500/20 px-2 py-0.5 rounded-full">
            {filteredMonitors.length} {filteredMonitors.length === 1 ? 'incident' : 'incidents'}
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
            <span>Failed to load Uptime Robot data</span>
          </div>
        </DashboardCard>
      )}

      {!isLoading && !error && filteredMonitors.length === 0 && (
        <EmptyState />
      )}

      {!isLoading && !error && filteredMonitors.length > 0 && (
        filteredMonitors.map((monitor, index) => (
          <UptimeRobotCard
            key={`${monitor.monitorId}-${index}`}
            clientName={monitor.clientName}
            monitorName={monitor.monitorName}
            status={monitor.status}
            lastDown={monitor.lastDown}
            url={monitor.url}
            statusUrl={monitor.statusUrl}
            isCritical={monitor.isCritical} // 💥 Nuevo prop
          />
        ))
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
  <DashboardCard>
    <div className="flex flex-col items-center py-6">
      <ArrowRightIcon className="text-gray-500 mb-4 h-12 w-12" />
      <p className="text-gray-400 mb-1">All monitors are up</p>
      <p className="text-xs text-gray-500">No incidents detected</p>
    </div>
  </DashboardCard>
);

export default UptimeRobotColumn;
