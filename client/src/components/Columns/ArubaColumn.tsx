import { CloudOff, WifiIcon } from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import ArubaCard from "@/components/Cards/ArubaCard";
import { ArubaSite } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface ArubaColumnProps {
  data: { data: ArubaSite[]; timestamp: string } | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Función para determinar si un sitio es crítico
const isSiteCritical = (site: ArubaSite) => {
  return site.total_devices_problem === site.total_devices;
};

const ArubaColumn = ({ data, isLoading, error }: ArubaColumnProps) => {
  const affectedSites = data?.data.filter(site => site.total_devices_problem > 0) || [];

  // Ordenar sitios: críticos primero
  const sortedAffectedSites = affectedSites.sort((a, b) => {
    const aIsCritical = isSiteCritical(a);
    const bIsCritical = isSiteCritical(b);

    // Críticos primero
    return Number(bIsCritical) - Number(aIsCritical);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <WifiIcon className="w-6 h-6 text-green-600 mr-2" />
          Aruba
        </h2>
        {!isLoading && !error && (
          <div className="flex gap-2">
            {affectedSites.filter(s => isSiteCritical(s)).length > 0 && (
              <span className="text-sm text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                {affectedSites.filter(s => isSiteCritical(s)).length} caídos
              </span>
            )}
            <span className="text-sm text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
              {affectedSites.filter(s => !isSiteCritical(s)).length} con problemas
            </span>
          </div>
        )}
      </div>

      {isLoading && <LoadingSkeleton />}

      {error && (
        <DashboardCard variant="critical">
          <div className="flex flex-col items-center text-center py-6">
            <CloudOff className="text-red-500 mb-3 h-14 w-14 animate-pulse" />
            <h3 className="text-lg font-semibold text-red-600">
              Error al conectar con Aruba
            </h3>
            <p className="text-sm text-red-400 mt-1">
              No se pudieron cargar los datos de la API.
            </p>
          </div>
        </DashboardCard>
      )}

      {!isLoading && !error && affectedSites.length === 0 && <EmptyState />}

      {!isLoading && !error && affectedSites.length > 0 && (
        <>
          {sortedAffectedSites.map((site, index) => (
            <ArubaCard
              key={`aruba-site-${index}`}
              siteName={site.site_name}
              siteId={site.site_id}
              totalDevices={site.total_devices}
              totalDevicesWithProblems={site.total_devices_problem}
              devices={site.devices_problem || []}
            />
          ))}

          <DashboardCard className="p-2">
            <div className="text-center text-sm text-gray-500 font-medium">
              Total sitios afectados: {affectedSites.length}
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
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  </DashboardCard>
);

const EmptyState = () => (
  <DashboardCard variant="success">
    <div className="flex flex-col items-center py-6">
      <WifiIcon className="text-green-500 mb-4 h-12 w-12" />
      <p className="text-green-600 mb-1">Todos los dispositivos conectados</p>
      <p className="text-xs text-green-500">La red opera con normalidad</p>
    </div>
  </DashboardCard>
);

export default ArubaColumn;