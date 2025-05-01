import { TriangleAlert, ServerIcon } from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import ExternalServiceCard from "@/components/Cards/ExternalServiceCard";
import { ExternalServices, ServiceStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface ExternalServicesColumnProps {
  data: ExternalServices | undefined;
  isLoading: boolean;
  error: Error | null;
}

// Define external services with their status pages
const serviceUrls: Record<string, string> = {
  "No-IP": "https://status.noip.com/",
  "AnyDesk": "https://status.anydesk.com/",
  "Freshdesk": "https://updates.freshdesk.com/",
  "UptimeRobot": "https://status.uptimerobot.com/",
  "Slack": "https://slack-status.com/",
  "Google Workspace": "https://www.google.com/appsstatus/dashboard/",
  "NextDNS": "https://ping.nextdns.io/",
  "Google Cloud": "https://status.cloud.google.com/"
};

const ExternalServicesColumn = ({ data, isLoading, error }: ExternalServicesColumnProps) => {
  // Transform raw data to service status objects
  const serviceStatuses: ServiceStatus[] = !data ? [] : Object.entries(data.services).map(([name, status]) => ({
    name,
    status,
    statusText: status === "Up" ? "Operacional" : "Fuera de servicio",
    statusUrl: serviceUrls[name] || "#"
  }));

  // Format the last updated timestamp
  const lastUpdated = data?.timestamp 
    ? format(new Date(data.timestamp), 'MMM d, h:mm a')
    : 'Unknown';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          External Services
        </h2>
        {!isLoading && !error && data && (
          <span className="text-xs text-gray-400">Updated {lastUpdated}</span>
        )}
      </div>
      
      {isLoading && (
        <DashboardCard>
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </DashboardCard>
      )}
      
      {error && (
        <DashboardCard>
          <div className="flex items-center text-destructive gap-2">
            <TriangleAlert className="h-5 w-5" />
            <span>Failed to load external services data</span>
          </div>
        </DashboardCard>
      )}
      
      {!isLoading && !error && serviceStatuses.length === 0 && (
        <EmptyState />
      )}
      
      {!isLoading && !error && serviceStatuses.length > 0 && (
        <DashboardCard>
          <div className="grid grid-cols-2 gap-4">
            {serviceStatuses.map((service, index) => (
              <ExternalServiceCard key={`${service.name}-${index}`} service={service} />
            ))}
          </div>
        </DashboardCard>
      )}
    </div>
  );
};

const EmptyState = () => (
  <DashboardCard>
    <div className="flex flex-col items-center py-6">
      <ServerIcon className="text-gray-500 mb-4 h-12 w-12" />
      <p className="text-gray-400 mb-1">No external service data</p>
      <p className="text-xs text-gray-500">Check configuration</p>
    </div>
  </DashboardCard>
);

export default ExternalServicesColumn;
