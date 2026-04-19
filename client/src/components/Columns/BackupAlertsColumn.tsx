import { useState } from "react";
import { TriangleAlert, HardDriveIcon, Database, ExternalLink } from "lucide-react";
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
      newSet.has(alertId) ? newSet.delete(alertId) : newSet.add(alertId);
      return newSet;
    });
  };

  const failedArray = !data
    ? []
    : Object.entries(data)
      .filter(([, alert]) => alert.Estado === "Failed")
      .map(([cliente, alert]) => {
        const body = alert.CuerpoTraducido || alert.Cuerpo || "";
        return {
          id: cliente,
          cliente,
          estado: alert.Estado,
          fechaEnvio: alert.FechaEnvio,
          resumen: body.substring(0, 230) + (body.length > 230 ? '...' : ''),
          cuerpoCompleto: body,
          gmailLink: alert.GmailLink || "",
        };
      });

  return (
    <div className="col">
      <div className="col-head" style={{ minHeight: '44px' }}>
        <div className="col-title flex items-center gap-2" style={{ fontSize: '18px', fontWeight: 700 }}>
          <Database className="w-5 h-5 text-[#ff5d7a]" aria-hidden="true" />
          ALERTAS DE BACKUP
        </div>

        <div className="tabs !mb-0" style={{ transform: 'scale(0.85)', transformOrigin: 'right center' }}>
          <button className="tab active">
            Fallidos ({failedArray.length})
          </button>
        </div>
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
            <TriangleAlert className="h-5 w-5" aria-hidden="true" />
            <span>No se pudieron cargar las alertas de backup</span>
          </div>
        </DashboardCard>
      )}

      {!isLoading && !error && failedArray.length === 0 && <EmptyState />}

      {!isLoading && !error && failedArray.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-start">
            {failedArray.map((alert, index) => {
              return (
                <BackupAlertCard
                  key={alert.id}
                  clientName={alert.cliente}
                  status={alert.estado}
                  sentDate={alert.fechaEnvio}
                  summary={alert.resumen}
                  fullBody={alert.cuerpoCompleto}
                  gmailLink={alert.gmailLink}
                  isExpanded={expandedAlerts.has(alert.id)}
                  onToggleExpand={() => toggleExpand(alert.id)}
                />
              );
            })}
          </div>
        </>
      )}

      {!isLoading && !error && (
        <div className="text-left mt-6">
          <a
            href="https://backup.quaga.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="backup-main-btn"
          >
            Ver historial completo en backup.quaga.ar
            <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
};

const LoadingSkeleton = () => (
  <DashboardCard>
    <div className="space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-4 w-3/4" />
      <div className="flex justify-start pt-1">
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  </DashboardCard>
);

const EmptyState = () => (
  <div className="border border-green-500 rounded-xl overflow-hidden">
    <DashboardCard>
      <div className="flex flex-col items-center py-6">
        <HardDriveIcon className="text-gray-500 mb-4 h-12 w-12" aria-hidden="true" />
        <p className="text-gray-400 mb-1">No hay alertas de backup</p>
        <p className="text-xs text-gray-500">Todos los backups funcionan correctamente</p>
      </div>
    </DashboardCard>
  </div>
);

export default BackupAlertsColumn;