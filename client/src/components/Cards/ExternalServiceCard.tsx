import { ExternalLinkIcon } from "lucide-react";
import { ServiceStatus } from "@/types";

interface ExternalServiceCardProps {
  service: ServiceStatus;
}

const ExternalServiceCard = ({ service }: ExternalServiceCardProps) => {
  const isOperational = service.status === "Up";

  return (
    <div className="space-y-2 p-3 rounded-lg bg-background/50">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-sm">{service.name}</h3>
        <div className={`status-badge ${isOperational ? 'status-success' : 'status-error'}`}>
          <span className="status-badge-dot"></span>
          {service.statusText}
        </div>
      </div>
      <a 
        href={service.statusUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs text-primary flex items-center hover:underline"
      >
        Status page
        <ExternalLinkIcon className="ml-1 h-3 w-3" />
      </a>
    </div>
  );
};

export default ExternalServiceCard;
