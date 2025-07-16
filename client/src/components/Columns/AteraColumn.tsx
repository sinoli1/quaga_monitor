import { TriangleAlert, ShieldAlertIcon } from "lucide-react";
import { GrServerCluster } from "react-icons/gr";

import DashboardCard from "@/components/Dashboard/Card";
import AteraCard from "@/components/Cards/AteraCard";
import { AteraAlert } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface AteraColumnProps {
  data: { [key: string]: AteraAlert } | undefined;
  isLoading: boolean;
  error: Error | null;
}

// 🧠 Función para extraer el top 3 de procesos del mensaje
const extractTopProcesses = (message: string): { name: string; memory: string }[] | null => {
  const match = message.match(/Top 3 procesos.*?:\s(.+)$/);
  if (!match) return null;

  const processString = match[1]
    .replace(/\sy\s/g, ", ") // Reemplaza " y " por ", " para unificar separadores
    .trim();

  const entries = processString.split(",").map(proc => {
    const [name, mem] = proc.split(":").map(p => p.trim());
    return { name, memory: mem };
  });

  return entries.length > 0 ? entries : null;
};

const AteraColumn = ({ data, isLoading, error }: AteraColumnProps) => {
  const sortedAlerts = data
    ? Object.values(data.alerts).sort((a, b) => {
        if (
          a.AlertMessage.includes("Estado de la máquina Desconocido") &&
          !b.AlertMessage.includes("Estado de la máquina Desconocido")
        ) {
          return -1;
        }
        if (
          !a.AlertMessage.includes("Estado de la máquina Desconocido") &&
          b.AlertMessage.includes("Estado de la máquina Desconocido")
        ) {
          return 1;
        }
        return 0;
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
          <span className="text-sm text-white bg-lime-500/20 px-2 py-0.5 rounded-full">
            {sortedAlerts.length} {sortedAlerts.length === 1 ? 'alerta' : 'alertas'}
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
            <span>Fallo al cargar los datos de Atera.</span>
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
              topProcesses={extractTopProcesses(alert.AlertMessage)}
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
        <p className="text-xs text-green-500">Todos los servidores estan operativos</p>
      </div>
    </DashboardCard>
  </div>
);

export default AteraColumn;
