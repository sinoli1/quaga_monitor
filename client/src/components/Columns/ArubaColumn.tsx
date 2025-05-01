import { TriangleAlert, WifiIcon } from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import ArubaCard from "@/components/Cards/ArubaCard";
import { ArubaSite } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface ArubaColumnProps {
  data: ArubaSite[] | undefined;
  isLoading: boolean;
  error: Error | null;
}

const ArubaColumn = ({ data, isLoading, error }: ArubaColumnProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
          Aruba
        </h2>
        {!isLoading && !error && data && (
          <span className="text-xs text-gray-400">
            {data.filter(site => site.total_devices_problem > 0).length} {
              data.filter(site => site.total_devices_problem > 0).length === 1 
                ? 'site affected' 
                : 'sites affected'
            }
          </span>
        )}
      </div>
      
      {isLoading && (
        <>
          <LoadingSkeleton />
        </>
      )}
      
      {error && (
        <DashboardCard>
          <div className="flex items-center text-destructive gap-2">
            <TriangleAlert className="h-5 w-5" />
            <span>Failed to load Aruba data</span>
          </div>
        </DashboardCard>
      )}
      
      {!isLoading && !error && (!data || data.length === 0 || data.every(site => site.total_devices_problem === 0)) && (
        <EmptyState />
      )}
      
      {!isLoading && !error && data && (
        data
          .filter(site => site.total_devices_problem > 0)
          .map((site, index) => (
            <ArubaCard
              key={`aruba-site-${index}`}
              siteName={site.site_name}
              totalDevices={site.total_devices}
              totalDevicesWithProblems={site.total_devices_problem}
              devices={site.devices || []}
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
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  </DashboardCard>
);

const EmptyState = () => (
  <DashboardCard>
    <div className="flex flex-col items-center py-6">
      <WifiIcon className="text-gray-500 mb-4 h-12 w-12" />
      <p className="text-gray-400 mb-1">All devices connected</p>
      <p className="text-xs text-gray-500">Network operating normally</p>
    </div>
  </DashboardCard>
);

export default ArubaColumn;
