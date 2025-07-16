import { TriangleAlert, ServerIcon, Cog } from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMeta } from "@fortawesome/free-brands-svg-icons";
import { faA } from "@fortawesome/free-solid-svg-icons";
import ExternalServiceCard from "@/components/Cards/ExternalServiceCard";
import { Mikrotik } from "@/components/Icons/Mikrotik";
import { ExternalServices, ServiceStatus } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Mercadopago } from "@/components/Icons/Mercadopago";
import { Noip } from "@/components/Icons/Noip";
import { format } from "date-fns";
import {
  SiGoogle,
  SiSlack,
  SiNextdns,
  SiCodefresh,
  SiAnydesk,
  SiGooglecloud,
  SiCloudflare 
} from "react-icons/si";
import { TbBrandOffice } from "react-icons/tb";
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
  "Microsoft 365": "https://portal.office.com/servicestatus/",
  "Cloudflare": "https://www.cloudflarestatus.com/",
  "Google Cloud": "https://status.cloud.google.com/",
  "Meta": "https://metastatus.com/",
  "MercadoPago": "https://status.mercadopago.com/",
  "AFIP": "https://www.afip.gob.ar",
  "Cloud MikroTik": "https://www.nslookup.io/domains/cloud2.mikrotik.com/dns-records/"

};

const serviceIcons: Record<string, JSX.Element> = {
  "No-IP": <Noip className="text-lg text-green-600 mr-2" />,
  "AnyDesk": <SiAnydesk className="text-lg text-red-300 mr-2" />,
  "Freshdesk": <SiCodefresh className="text-lg text-blue-300 mr-2" />,
  "UptimeRobot": <FaCircleDot className="text-lg text-green-300 mr-2" />,
  "Slack": <SiSlack className="text-lg text-yellow-300 mr-2" />,
  "Google Workspace": <SiGoogle className="text-lg text-orange-300 mr-2" />,
  "NextDNS": <SiNextdns className="text-lg text-blue-300 mr-2" />,
  "Google Cloud": <SiGooglecloud className="text-lg text-orange-300 mr-2" />,
  "Microsoft 365": <TbBrandOffice className="text-lg text-blue-300 mr-2" />,
  "Cloudflare": <SiCloudflare className="text-lg text-red-300 mr-2"/>,
  "Meta": <FontAwesomeIcon icon={faMeta} className="text-blue-500 mr-2" />,
  "MercadoPago": <Mercadopago className="text-blue-300 mr-2 w-5 h-5" />,
  "AFIP": <FontAwesomeIcon icon={faA} className="text-blue-500 mr-2"/>,
  "Cloud MikroTik": <Mikrotik className="text-blue-500 mr-2 w-5 h-5" />

};

const ExternalServicesColumn = ({ data, isLoading, error }: ExternalServicesColumnProps) => {
  const serviceStatuses: ServiceStatus[] = !data ? [] : Object.entries(data.services).map(([name, status]) => ({
  name,
  status,
  statusText: status === "Up" ? "Operacional" : status === "Degraded" ? "Degradado" : "Fuera de servicio",
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
          Servicios externos
        </h2>
        {!isLoading && !error && data && (
          <span className="text-sm text-blue-400 bg--500/20 px-2 py-0.5 rounded-full">Actualizado {lastUpdated}</span>
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
  <div className="border border-red-500 rounded-2xl overflow-hidden">
    <DashboardCard>
      <div className="flex flex-col items-center py-6">
        <ServerIcon className="text-red-500 mb-4 h-12 w-12" />
        <p className="text-red-600 mb-1">No external service data</p>
        <p className="text-xs text-red-500">Check configuration</p>
      </div>
    </DashboardCard>
  </div>
);

export default ExternalServicesColumn;
