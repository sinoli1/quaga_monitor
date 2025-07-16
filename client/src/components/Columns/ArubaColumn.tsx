import { TriangleAlert, WifiIcon } from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import ArubaCard from "@/components/Cards/ArubaCard";
import { ArubaSite } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";


interface ArubaColumnProps {
  data: { data: ArubaSite[]; timestamp: string } | undefined;
  isLoading: boolean;
  error: Error | null;
}

const ArubaColumn = ({ data, isLoading, error }: ArubaColumnProps) => {
  const affectedSites = data?.data.filter(site => site.total_devices_problem > 0) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <WifiIcon className="w-6 h-6 text-green-600 mr-2" />
          Aruba
        </h2>
        {!isLoading && !error && (
          <span className="text-sm text-white bg-lime-500/20 px-2 py-0.5 rounded-full">
            {affectedSites.length} {affectedSites.length === 1 ? 'sitio afectado' : 'sitios afectados'}
          </span>
        )}
      </div>

      {isLoading && <LoadingSkeleton />}

      {error && (
        <DashboardCard>
          <div className="flex items-center text-destructive gap-2">
            <TriangleAlert className="h-5 w-5" />
            <span>Error al pedir los datos de Aruba</span>
          </div>
        </DashboardCard>
      )}

      {!isLoading && !error && affectedSites.length === 0 && <EmptyState />}

      {!isLoading && !error && affectedSites.length > 0 && (
        <>
          {affectedSites.map((site, index) => (
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
  <DashboardCard className="border border-green-500">
    <div className="flex flex-col items-center py-6">
      <WifiIcon className="text-green-500 mb-4 h-12 w-12" />
      <p className="text-green-600 mb-1">Todos los dispositivos conectados</p>
      <p className="text-xs text-green-500">La red opera con normalidad</p>
    </div>
  </DashboardCard>
);

export default ArubaColumn;
