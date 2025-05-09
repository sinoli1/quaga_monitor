import { TriangleAlert, ServerIcon, Cog } from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import ExternalServiceCard from "@/components/Cards/ExternalServiceCard";
import { ExternalServices, ServiceStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  SiGoogle,
  SiSlack,
  SiNextdns,
  SiCodefresh,
  SiAnydesk,
  SiGooglecloud
} from "react-icons/si";
import { RiProhibited2Line } from "react-icons/ri";
import { FaCircleDot } from "react-icons/fa6";


interface ExternalServicesColumnProps {
  data: ExternalServices | undefined;
  isLoading: boolean;
  error: Error | null;
}

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

const serviceIcons: Record<string, JSX.Element> = {
  "No-IP": <RiProhibited2Line className="text-lg text-green-600 mr-2" />,
  "AnyDesk": <SiAnydesk className="text-lg text-red-300 mr-2" />,
  "Freshdesk": <SiCodefresh className="text-lg text-blue-300 mr-2" />,
  "UptimeRobot": <FaCircleDot className="text-lg text-green-300 mr-2" />,
  "Slack": <SiSlack className="text-lg text-yellow-300 mr-2" />,
  "Google Workspace": <SiGoogle className="text-lg text-orange-300 mr-2" />,
  "NextDNS": <SiNextdns className="text-lg text-blue-300 mr-2" />,
  "Google Cloud": <SiGooglecloud className="text-lg text-orange-300 mr-2" />
};

const ExternalServicesColumn = ({ data, isLoading, error }: ExternalServicesColumnProps) => {
  const serviceStatuses: ServiceStatus[] = !data ? [] : Object.entries(data.services).map(([name, status]) => ({
    name,
    status,
    statusText: status === "Up" ? "Operacional" : "Fuera de servicio",
    statusUrl: serviceUrls[name] || "#",
    icon: serviceIcons[name]
  }));

  const lastUpdated = data?.timestamp 
    ? format(new Date(data.timestamp), 'MMM d, h:mm a')
    : 'Unknown';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center">
          <Cog className="w-6 h-6 text-green-500 mr-2" />
          External Services
        </h2>
        {!isLoading && !error && data && (
          <span className="text-sm text-blue-400 bg--500/20 px-2 py-0.5 rounded-full">Updated {lastUpdated}</span>
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
