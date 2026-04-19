import { TriangleAlert, ServerIcon, Cog, Globe, Bot, Network, ShieldCheck } from "lucide-react";
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
import { OpenaiChatgpt } from "@/components/Icons/ChatGPT";
import { MiAfip } from "@/components/Icons/ARCA";
import { Atera } from "@/components/Icons/Atera";
import { UptimeRobot as UptimeRobotIcon } from "@/components/Icons/UptimeRobot";
import { format } from "date-fns";
import {
  SiGoogle,
  SiClickup,
  SiNextdns,
  SiCodefresh,
  SiAnydesk,
  SiGooglecloud,
  SiCloudflare,
  SiDropbox
} from "react-icons/si";
import { TbBrandOffice } from "react-icons/tb";
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
  "ClickUp": "https://status.clickup.com/",
  "Google Workspace": "https://www.google.com/appsstatus/dashboard/",
  "NextDNS": "https://ping.nextdns.io/",
  "Microsoft 365": "https://portal.office.com/servicestatus/",
  "Cloudflare": "https://www.cloudflarestatus.com/",
  "Google Cloud": "https://status.cloud.google.com/",
  "Meta": "https://metastatus.com/",
  "Dropbox": "https://status.dropbox.com/",
  "AFIP": "https://www.afip.gob.ar/",
  "MercadoPago": "https://status.mercadopago.com/",
  "ChatGPT": "https://status.openai.com/",
  "Cloud MikroTik": "https://www.nslookup.io/domains/cloud2.mikrotik.com/dns-records/",
  "Claude": "https://status.anthropic.com/",
  "Atera": "https://status.atera.com/",
  "DNSStatus": "https://dnsstatus.com/",
  "Sophos": "https://status.sophos.com/"
};

const serviceIcons: Record<string, JSX.Element> = {
  "No-IP": <Noip className="text-lg text-green-600 mr-2 w-5 h-5" />,
  "AnyDesk": <SiAnydesk className="text-lg text-red-500 mr-2 w-5 h-5" />,
  "Freshdesk": <SiCodefresh className="text-lg text-blue-300 mr-2 w-5 h-5" />,
  "UptimeRobot": <UptimeRobotIcon className="text-lg text-[#3BD771] mr-2 w-5 h-5" />,
  "ClickUp": <SiClickup className="text-lg text-blue-300 mr-2 w-5 h-5" />,
  "Google Workspace": <SiGoogle className="text-lg text-orange-300 mr-2 w-5 h-5" />,
  "NextDNS": <SiNextdns className="text-lg text-blue-300 mr-2 w-5 h-5" />,
  "Google Cloud": <SiGooglecloud className="text-lg text-orange-300 mr-2 w-5 h-5" />,
  "Microsoft 365": <TbBrandOffice className="text-lg text-blue-300 mr-2 w-5 h-5" />,
  "Cloudflare": <SiCloudflare className="text-lg text-red-300 mr-2 w-5 h-5" />,
  "Meta": <FontAwesomeIcon icon={faMeta} className="text-blue-500 mr-2 w-5 h-5" />,
  "MercadoPago": <Mercadopago className="text-blue-300 mr-2 w-5 h-5" />,
  "ChatGPT": <OpenaiChatgpt className="text-white mr-2 w-5 h-5" />,
  "AFIP": <MiAfip className="text-white mr-2 w-5 h-5" />,
  "Dropbox": <SiDropbox className="text-blue-500 mr-2 w-5 h-5" />,
  "Cloud MikroTik": <Mikrotik className="text-white-500 mr-2 w-5 h-5" />,
  "Claude": <Bot className="text-orange-400 mr-2 w-5 h-5" />,
  "Atera": <Atera className="text-pink-500 mr-2 w-5 h-5" />,
  "DNSStatus": <Network className="text-blue-400 mr-2 w-5 h-5" />,
  "Sophos": <ShieldCheck className="text-blue-600 mr-2 w-5 h-5" />
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
    <div className="col">
      <div className="col-head" style={{ minHeight: '44px' }}>
        <div className="col-title flex items-center gap-2" style={{ fontSize: '18px', fontWeight: 700 }}>
          <Globe className="w-5 h-5 text-[#86b4ff]" aria-hidden="true" />
          SERVICIOS EXTERNOS
        </div>
        <div className="col-counts">
          {!isLoading && !error && data && (
            <span className="count-chip warning">Actualizado {lastUpdated}</span>
          )}
        </div>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
          {serviceStatuses.map((service, index) => (
            <ExternalServiceCard key={`${service.name}-${index}`} service={service} />
          ))}
        </div>
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
