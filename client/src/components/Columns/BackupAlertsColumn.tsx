import { useState } from "react";
import { TriangleAlert, HardDriveIcon, Database, CheckCircle2 } from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import BackupAlertCard from "@/components/Cards/BackupAlertCard";
import { BackupAlerts } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { es } from "date-fns/locale";

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
          resumen: alert.Cuerpo.substring(0, 100),
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

  // Mostrar 9 o todos según showAllSuccess
  const successListToShow = showAllSuccess ? successArray : successArray.slice(0, 12);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold flex items-center whitespace-nowrap text-white">
          <Database className="w-6 h-6 text-red-500 mr-2" aria-hidden="true" />
          Alertas de backup
        </h2>
        {!isLoading && !error && (
          <span className="text-sm text-white bg-lime-500/20 px-2 py-0.5 rounded-full whitespace-nowrap">
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

      {!isLoading && !error && alertsArray.length > 0 && (
        <>
          {alertsArray.map(alert => (
            <BackupAlertCard
              key={alert.id}
              clientName={alert.cliente}
              status={alert.estado}
              sentDate={alert.fechaEnvio}
              summary={alert.resumen}
              fullBody={alert.cuerpoCompleto}
              isExpanded={expandedAlerts.has(alert.id)}
              onToggleExpand={() => toggleExpand(alert.id)}
            />
          ))}

          <DashboardCard className="p-2">
            <div className="text-center text-sm text-gray-400 font-medium">
              Total de alertas: {alertsArray.length}
            </div>
          </DashboardCard>
        </>
      )}

      {/* Sección backups exitosos - SIEMPRE VISIBLE mostrando mínimo 9 */}
      {successArray.length > 0 && (
        <div>
          <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
            <h3 className="text-lg text-green-400 font-semibold flex items-center whitespace-nowrap">
              <CheckCircle2 className="w-5 h-5 mr-2" aria-hidden="true" />
              Backups exitosos
            </h3>
          </div>

          <ul
            className="text-sm text-gray-200 divide-y divide-gray-700 border border-gray-700 rounded-xl overflow-hidden"
          >
            {successListToShow
              .filter(item => item.cliente?.trim() !== "")
              .map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between px-3 py-2 bg-black/30"
                >
                  <span className="w-1/3 truncate font-medium text-white">{item.cliente}</span>
                  <span className="w-1/5 text-green-700 bg-green-300/20 px-2 py-0.5 rounded text-center text-xs font-semibold whitespace-nowrap">
                    {item.estado}
                  </span>
                  <span className="w-1/2 text-right text-xs text-gray-400 whitespace-nowrap">
                    {format(new Date(item.fechaEnvio), "eee, dd MMM yyyy HH:mm:ss", { locale: es })}
                  </span>
                </li>
              ))}
          </ul>

          {/* Botón para mostrar más/menos solo si hay más de 9 */}
          {successArray.length > 12 && (
            <div className="text-center mt-2">
              <button
                className="text-xs text-green-400 hover:underline"
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
  <div className="border border-green-500 rounded-2xl overflow-hidden">
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
