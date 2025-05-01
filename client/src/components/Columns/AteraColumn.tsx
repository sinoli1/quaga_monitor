import { TriangleAlert, ShieldAlertIcon } from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import AteraCard from "@/components/Cards/AteraCard";
import { AteraAlert } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface AteraColumnProps {
  data: AteraAlert[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const AteraColumn = ({ data, isLoading, error }: AteraColumnProps) => {
  // Sort alerts to put "Machine status unknown" first
  const sortedAlerts = data ? [...data].sort((a, b) => {
    if (a.AlertMessage.includes("Machine status unknown") && !b.AlertMessage.includes("Machine status unknown")) {
      return -1;
    }
    if (!a.AlertMessage.includes("Machine status unknown") && b.AlertMessage.includes("Machine status unknown")) {
      return 1;
    }
    return 0;
  }) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center">
          <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
          Atera
        </h2>
        {!isLoading && !error && (
          <span className="text-xs text-gray-400">
            {sortedAlerts.length} {sortedAlerts.length === 1 ? 'alert' : 'alerts'}
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
            <span>Failed to load Atera data</span>
          </div>
        </DashboardCard>
      )}
      
      {!isLoading && !error && sortedAlerts.length === 0 && (
        <EmptyState />
      )}
      
      {!isLoading && !error && sortedAlerts.length > 0 && (
        sortedAlerts.map((alert, index) => (
          <AteraCard
            key={`${alert.alert_id || index}`}
            title={`${alert.DeviceName} | ${alert.CustomerName}`}
            description={alert.AlertMessage}
            startTime={alert.incidents[0]?.created || ''}
            resolved={alert.resolved}
            isMachineStatusUnknown={alert.AlertMessage.includes("Machine status unknown")}
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
      <Skeleton className="h-4 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  </DashboardCard>
);

const EmptyState = () => (
  <DashboardCard>
    <div className="flex flex-col items-center py-6">
      <ShieldAlertIcon className="text-gray-500 mb-4 h-12 w-12" />
      <p className="text-gray-400 mb-1">No alerts detected</p>
      <p className="text-xs text-gray-500">All systems operational</p>
    </div>
  </DashboardCard>
);

export default AteraColumn;
