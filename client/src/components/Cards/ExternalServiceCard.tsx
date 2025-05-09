import { ExternalLinkIcon } from "lucide-react";
import { ServiceStatus } from "@/types";

interface ExternalServiceCardProps {
  service: ServiceStatus;
}

const ExternalServiceCard = ({ service }: ExternalServiceCardProps) => {
  const isOperational = service.status === "Up";

  return (
    <div className="space-y-2 p-3 rounded-lg bg-background/50">
      <div className="flex flex-wrap gap-2 justify-between items-center">
        <h3 className="font-medium text-sm flex items-center gap-2">
          {service.icon}
          {service.name}
        </h3>
        <div className={`status-badge ${isOperational ? 'status-success' : 'status-error'} min-w-min truncate`}>
          <span className="status-badge-dot"></span>
          <span className="truncate">
            {isOperational ? "Operacional" : "Fuera de servicio"}
          </span>
        </div>
      </div>
      <a 
        href={service.statusUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-xs text-primary flex items-center hover:underline"
      >
        Página de estado
        <ExternalLinkIcon className="ml-1 h-3 w-3" />
      </a>
    </div>
  );
};

export default ExternalServiceCard;
