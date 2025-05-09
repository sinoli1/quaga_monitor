import { Server, Info, ExternalLinkIcon } from 'lucide-react';
import { formatDistanceToNow, parseISO, differenceInDays } from "date-fns";
import DashboardCard from "@/components/Dashboard/Card";

interface AteraCardProps {
  title: string;
  description: string;
  startTime: string;
  resolved: string | null;
  deviceGuid: string;
}

const AteraCard = ({
  title,
  description,
  startTime,
  resolved,
  deviceGuid
}: AteraCardProps) => {
  const isCritical = description.includes("Estado de la máquina Desconocido");

  const formatStartTime = (time: string) => {
    try {
      return formatDistanceToNow(parseISO(time), { addSuffix: true });
    } catch (e) {
      return time;
    }
  };

  const getBadgeClass = (time: string) => {
    try {
      const days = differenceInDays(new Date(), parseISO(time));
      if (days <= 2) return "bg-blue-500/20 text-blue-400";
      if (days <= 6) return "bg-yellow-500/20 text-yellow-600";
      return "bg-red-500/20 text-red-500";
    } catch {
      return "bg-gray-500/20 text-gray-400";
    }
  };

  const formatDescription = (desc: string) => {
    const pattern = /(Top 3 procesos que activan la alerta:|Los 3 procesos principales que activan la alerta:)/;
    const match = desc.match(pattern);

    if (!match) return <p>{desc}</p>;

    const [mainMsgRaw, , processListRaw] = desc.split(pattern);

    // Unifica " y " como coma
    const normalized = processListRaw.replace(/ y /g, ", ");

    // Regex para capturar "Nombre: número MB", ignorando comas de miles
    const processRegex = /([A-Za-z0-9.\-_: ]+): ([\d,]+\.\d+ MB)/g;
    const matches = Array.from(normalized.matchAll(processRegex)).map(([, name, value]) => ({
      name: name.trim(),
      value,
      valueMB: parseFloat(value.replace(/,/g, '')) // para orden
    }));

    // Ordenar de mayor a menor consumo
    const sortedProcesses = matches.sort((a, b) => b.valueMB - a.valueMB);

    return (
      <>
        <p className="mb-1">{mainMsgRaw.trim()}</p>
        <ul className="list-disc list-inside text-gray-300 space-y-0.5">
          {sortedProcesses.map((proc, i) => (
            <li key={i}>
              <span className="font-medium text-white">{proc.name}</span>: {proc.value}
            </li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <DashboardCard
      highlightBorder={isCritical}
      highlightColor={isCritical ? 'border-red-500' : undefined}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium flex items-center gap-2">
          <Server className="w-5 h-5 text-red-500" />
          {title}
        </h3>
        <div className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
          isCritical
            ? 'text-red-500 bg-red-500/10'
            : 'text-orange-400 bg-orange-500/20'
        }`}>
          {isCritical ? 'Critical' : 'Warning'}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex gap-2 text-gray-400">
          <Info className="w-4 h-4 mt-1 text-blue-400" />
          <div>{formatDescription(description)}</div>
        </div>

        <div className="flex justify-between text-xs items-center">
          <span className="text-gray-400 inline-flex items-center gap-1">
            <span className="font-medium text-white">Started:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getBadgeClass(startTime)}`}>
              {formatStartTime(startTime)}
            </span>
          </span>
          <span className="font-medium">
            <a
              href={`https://app.atera.com/new/rmm/device/${deviceGuid}/agent`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:text-primary-light flex items-center"
            >
              Ir a Atera
              <ExternalLinkIcon className="h-3 w-3 ml-1" />
            </a>
          </span>
        </div>
      </div>
    </DashboardCard>
  );
};

export default AteraCard;
