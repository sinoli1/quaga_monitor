import { useState } from "react";
import { TriangleAlert, HardDriveIcon, Database, CheckCircle2 } from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import BackupAlertCard from "@/components/Cards/BackupAlertCard";
import SuccessBackupCard from "@/components/Cards/SuccessBackupCard"; // << IMPORTADO
import { BackupAlerts } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
// Removimos la importación de format y es de date-fns, ya que se movió a SuccessBackupCard

interface BackupAlertsColumnProps {
  data: BackupAlerts | undefined;
  isLoading: boolean;
  error: Error | null;
}

const BackupAlertsColumn = ({ data, isLoading, error }: BackupAlertsColumnProps) => {
  const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());
  const [showAllSuccess, setShowAllSuccess] = useState(false);

  const toggleExpand = (alertId: string) => {
    setExpandedAlerts(prev => {
      const newSet = new Set(prev);
      newSet.has(alertId) ? newSet.delete(alertId) : newSet.add(alertId);
      return newSet;
    });
  };

  const alertsArray = !data
    ? []
    : Object.entries(data)
        .filter(([, alert]) => alert.Estado === "Failed")
        .map(([cliente, alert]) => ({
          id: cliente,
          cliente,
          estado: alert.Estado,
          fechaEnvio: alert.FechaEnvio,
          resumen: alert.Cuerpo.substring(0, 120),
          cuerpoCompleto: alert.Cuerpo,
        }));

  const successArray = !data
    ? []
    : Object.entries(data)
        .filter(([, alert]) => alert.Estado === "Success")
        .map(([cliente, alert]) => ({
          cliente,
          estado: alert.Estado,
          fechaEnvio: alert.FechaEnvio,
        }));

  const successListToShow = showAllSuccess ? successArray : successArray.slice(0, 9); 
  
  // NOTE: formatSuccessDate ha sido movido a SuccessBackupCard.tsx
  // const formatSuccessDate = (dateString: string) => { ... }

  return (
    <div className="space-y-4">
      {/* HEADER PRINCIPAL: Título y Badge de Cantidad */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold flex items-center whitespace-nowrap text-white">
          <Database className="w-6 h-6 text-red-500 mr-2" aria-hidden="true" />
          Alertas de backup
        </h2>
        {!isLoading && !error && (
          <span className="text-sm text-white bg-red-500/20 px-3 py-1 rounded-full whitespace-nowrap font-medium border border-red-500/50">
            {alertsArray.length} {alertsArray.length === 1 ? "alerta" : "alertas"}
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
            <TriangleAlert className="h-5 w-5" aria-hidden="true" />
            <span>No se pudieron cargar las alertas de backup</span>
          </div>
        </DashboardCard>
      )}

      {!isLoading && !error && alertsArray.length === 0 && <EmptyState />}

      {/* LISTA DE ALERTAS DE FALLO (Dos columnas) */}
      {!isLoading && !error && alertsArray.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alertsArray.map((alert, index) => {
                const isLast = index === alertsArray.length - 1;
                const isOddCount = alertsArray.length % 2 !== 0;
                
                const wrapperClasses = (isLast && isOddCount) ? "md:col-span-2" : "";

                return (
                    <div key={alert.id} className={wrapperClasses}>
                        <BackupAlertCard
                          clientName={alert.cliente}
                          status={alert.estado}
                          sentDate={alert.fechaEnvio}
                          summary={alert.resumen}
                          fullBody={alert.cuerpoCompleto}
                          isExpanded={expandedAlerts.has(alert.id)}
                          onToggleExpand={() => toggleExpand(alert.id)}
                        />
                    </div>
                );
            })}
          </div>

          <DashboardCard className="p-2">
            <div className="text-center text-sm text-gray-400 font-medium">
              Total de alertas: {alertsArray.length}
            </div>
          </DashboardCard>
        </>
      )}

      {/* SECCIÓN BACKUPS EXITOSOS (Ahora en dos columnas con SuccessBackupCard) */}
      {successArray.length > 0 && (
        <div className="pt-2">
          <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
            <h3 className="text-lg text-green-400 font-semibold flex items-center whitespace-nowrap">
              <CheckCircle2 className="w-5 h-5 mr-2" aria-hidden="true" />
              Backups exitosos
            </h3>
          </div>

          {/* GRID DE ÉXITOS - Reemplaza <ul> */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {successListToShow
              .filter(item => item.cliente?.trim() !== "")
              .map((item, i) => (
                <SuccessBackupCard
                    key={i}
                    clientName={item.cliente}
                    status={item.estado}
                    sentDate={item.fechaEnvio}
                />
              ))}
          </div>

          {/* Botón para mostrar más/menos */}
          {successArray.length > 9 && (
            <div className="text-center mt-2">
              <button
                className="text-xs text-green-400 hover:text-green-300 underline underline-offset-2 transition-colors"
                onClick={() => setShowAllSuccess(prev => !prev)}
                aria-expanded={showAllSuccess}
                aria-controls="success-list"
              >
                {showAllSuccess ? "Mostrar menos" : `Mostrar todos (${successArray.length})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const LoadingSkeleton = () => (
// ... (mantenemos las funciones de esqueleto y estado vacío)
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