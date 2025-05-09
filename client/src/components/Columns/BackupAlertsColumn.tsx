import { useState } from "react";
import { TriangleAlert, HardDriveIcon, Database } from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import BackupAlertCard from "@/components/Cards/BackupAlertCard";
import { BackupAlerts } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface BackupAlertsColumnProps {
  data: BackupAlerts | undefined;
  isLoading: boolean;
  error: Error | null;
}

const BackupAlertsColumn = ({ data, isLoading, error }: BackupAlertsColumnProps) => {
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

  const toggleExpand = (alertId: string) => {
    setExpandedAlerts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(alertId)) {
        newSet.delete(alertId);
      } else {
        newSet.add(alertId);
      }
      return newSet;
    });
  };

  // Transform and filter data: only include failed alerts
  const alertsArray = !data
    ? []
    : Object.entries(data)
        .filter(([, alert]) => alert.Estado === "Failed")
        .map(([client, alert]) => ({
          id: client,
          client,
          status: alert.Estado,
          sentDate: alert.FechaEnvio,
          summary: alert.Cuerpo.substring(0, 100),
          fullBody: alert.Cuerpo
        }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
      <h2 className="text-xl font-semibold flex items-center">
        <Database className="w-6 h-6 text-red-500 mr-2" />
        Backup Alerts
      </h2>
        {!isLoading && !error && alertsArray && (
          <span className="text-sm text-white bg-lime-500/20 px-2 py-0.5 rounded-full">
            {alertsArray.length} {alertsArray.length === 1 ? 'alert' : 'alerts'}
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
            <span>Failed to load backup alerts data</span>
          </div>
        </DashboardCard>
      )}
      
      {!isLoading && !error && alertsArray.length === 0 && (
        <EmptyState />
      )}
      
      {!isLoading && !error && alertsArray.length > 0 && (
        alertsArray.map(alert => (
          <BackupAlertCard
            key={alert.id}
            clientName={alert.client}
            status={alert.status}
            sentDate={alert.sentDate}
            summary={alert.summary}
            fullBody={alert.fullBody}
            isExpanded={expandedAlerts.has(alert.id)}
            onToggleExpand={() => toggleExpand(alert.id)}
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
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-end">
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  </DashboardCard>
);

const EmptyState = () => (
  <DashboardCard>
    <div className="flex flex-col items-center py-6">
      <HardDriveIcon className="text-gray-500 mb-4 h-12 w-12" />
      <p className="text-gray-400 mb-1">No backup alerts</p>
      <p className="text-xs text-gray-500">All backups are functioning properly</p>
    </div>
  </DashboardCard>
);

export default BackupAlertsColumn;
