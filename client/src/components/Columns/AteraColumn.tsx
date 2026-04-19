import { CloudOff, ShieldAlertIcon } from "lucide-react";
import { GrServerCluster } from "react-icons/gr";

import DashboardCard from "@/components/Dashboard/Card";
import AteraCard from "@/components/Cards/AteraCard";
import { AteraAlert } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface AteraColumnProps {
  data: { alerts: { [key: string]: AteraAlert } } | undefined;
  isLoading: boolean;
  error: Error | null;
}

const isCriticalAlert = (title: string): boolean => {
  return title.toLowerCase().includes("machine status unknown");
};

const AteraColumn = ({ data, isLoading, error }: AteraColumnProps) => {
  const sortedAlerts = data
    ? Object.values(data.alerts).sort((a, b) => {
      // Primero: críticas por Title
      const aIsCritical = isCriticalAlert(a.Title);
      const bIsCritical = isCriticalAlert(b.Title);

      if (aIsCritical && !bIsCritical) return -1;
      if (!aIsCritical && bIsCritical) return 1;

      // Dentro del mismo nivel: por nombre del cliente (CustomerName)
      const customerCompare = a.CustomerName.localeCompare(b.CustomerName);
      if (customerCompare !== 0) return customerCompare;

      // Si es del mismo cliente: por tiempo (más recientes primero)
      const aTime = new Date(a.incidents[0]?.created || 0).getTime();
      const bTime = new Date(b.incidents[0]?.created || 0).getTime();
      return bTime - aTime;
    })
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <GrServerCluster className="w-6 h-6 text-orange-500 mr-2" />
          Atera
        </h2>
        {!isLoading && !error && (
          <div className="flex gap-2">
            {sortedAlerts.filter(a => isCriticalAlert(a.Title)).length > 0 && (
              <span className="text-sm text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                {sortedAlerts.filter(a => isCriticalAlert(a.Title)).length} apagado
              </span>
            )}
            <span className="text-sm text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
              {sortedAlerts.filter(a => !isCriticalAlert(a.Title)).length} alertas
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
              Error al conectar con Atera
            </h3>
            <p className="text-sm text-red-400 mt-1">
              No se pudo cargar los datos de la API.
            </p>
          </div>
        </DashboardCard>
      )}

      {!isLoading && !error && sortedAlerts.length === 0 && <EmptyState />}

      {!isLoading && !error && sortedAlerts.length > 0 && (
        <>
          {sortedAlerts.map((alert, index) => (
            <AteraCard
              key={`${alert.DeviceGuid || index}`}
              title={`${alert.DeviceName} | ${alert.CustomerName}`}
              description={alert.AlertMessage}
              startTime={alert.incidents[0]?.created || ''}
              resolved={alert.incidents[0]?.resolved}
              deviceGuid={alert.DeviceGuid}
              ipAddress={alert.IpAddress}
              os={alert.OS}
              alertTitle={alert.Title}
              hardwareDisks={alert.HardwareDisks}
              logo={alert.Logo}
              customerName={alert.CustomerName}
            />
          ))}

          <DashboardCard className="p-2">
            <div className="text-center text-sm text-gray-500 font-medium">
              Alertas totales: {sortedAlerts.length}
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
      <Skeleton className="h-4 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  </DashboardCard>
);

const EmptyState = () => (
  <div className="border border-green-500 rounded-2xl overflow-hidden">
    <DashboardCard>
      <div className="flex flex-col items-center py-6">
        <ShieldAlertIcon className="text-green-500 mb-4 h-12 w-12" />
        <p className="text-green-600 mb-1">No se detectaron alertas</p>
        <p className="text-xs text-green-500">Todos los servidores están operativos</p>
      </div>
    </DashboardCard>
  </div>
);

export default AteraColumn;