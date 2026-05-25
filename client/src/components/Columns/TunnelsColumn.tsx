import { TriangleAlert, ExternalLink, ShieldCheck } from "lucide-react";
import { SiCloudflare } from "react-icons/si";
import DashboardCard from "@/components/Dashboard/Card";
import TunnelCard from "@/components/Cards/TunnelCard";
import { TunnelsSummary } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface TunnelsColumnProps {
  data: TunnelsSummary | undefined;
  isLoading: boolean;
  error: Error | null;
}

const TunnelsColumn = ({ data, isLoading, error }: TunnelsColumnProps) => {
  const issues = !data
    ? []
    : data.tunnels
        .filter((t) => t.status === 'down' || t.status === 'degraded')
        .sort((a, b) => {
          if (a.status === b.status) return a.name.localeCompare(b.name);
          return a.status === 'down' ? -1 : 1;
        });

  const downCount = data?.counts.down ?? 0;
  const degradedCount = data?.counts.degraded ?? 0;

  return (
    <div className="col">
      <div className="col-head" style={{ minHeight: '44px' }}>
        <div className="col-title flex items-center gap-2" style={{ fontSize: '28px', fontWeight: 700 }}>
          <SiCloudflare className="w-7 h-7 text-[#f48120]" aria-hidden="true" />
          <h1>CLOUDFLARE TUNNELS</h1>
        </div>
        <div className="col-counts">
          {!isLoading && !error && downCount > 0 && (
            <span className="count-chip critical">{downCount} caídos</span>
          )}
          {!isLoading && !error && degradedCount > 0 && (
            <span className="count-chip warning">{degradedCount} degradados</span>
          )}
        </div>
      </div>

      {isLoading && (
        <DashboardCard>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        </DashboardCard>
      )}

      {error && (
        <DashboardCard>
          <div className="flex items-center text-destructive gap-2">
            <TriangleAlert className="h-5 w-5" aria-hidden="true" />
            <span>No se pudieron cargar los túneles</span>
          </div>
        </DashboardCard>
      )}

      {!isLoading && !error && issues.length === 0 && <EmptyState />}

      {!isLoading && !error && issues.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {issues.map((tunnel) => (
            <TunnelCard key={tunnel.id} tunnel={tunnel} />
          ))}
        </div>
      )}

      {!isLoading && !error && (
        <div className="text-left mt-6">
          <a
            href="https://tunel.quaga.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="backup-main-btn"
          >
            Ver más en tunel.quaga.ar
            <ExternalLink size={14} />
          </a>
        </div>
      )}
    </div>
  );
};

const EmptyState = () => (
  <div className="border border-green-500/40 rounded-xl overflow-hidden">
    <DashboardCard>
      <div className="flex flex-col items-center py-6">
        <ShieldCheck className="text-gray-500 mb-4 h-12 w-12" aria-hidden="true" />
        <p className="text-gray-400 mb-1">Todos los túneles operativos</p>
        <p className="text-xs text-gray-500">No hay caídos ni degradados</p>
      </div>
    </DashboardCard>
  </div>
);

export default TunnelsColumn;
