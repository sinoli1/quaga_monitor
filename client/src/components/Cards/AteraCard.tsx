import {
  ServerCrash,
  Info,
  ExternalLinkIcon,
  ClockAlert,
  CheckCircle2,
  HardDrive,
  MemoryStick,
  Circle
} from 'lucide-react';
import {
  parseISO,
  differenceInDays,
  differenceInHours,
  differenceInMinutes
} from 'date-fns';
import DashboardCard from "@/components/Dashboard/Card";
import { useMemo } from "react";

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
  const isCritical = useMemo(() => {
    const criticalPhrases = [
      "Estado de la máquina Desconocido",
      "Sin respuesta",
      "Sin conexión"
    ];
    return criticalPhrases.some(phrase =>
      description.toLowerCase().includes(phrase.toLowerCase())
    );
  }, [description]);

  const getCompactTimeAgo = (time: string) => {
    try {
      const now = new Date();
      const parsed = parseISO(time);
      const mins = differenceInMinutes(now, parsed);
      const hours = differenceInHours(now, parsed);
      const days = differenceInDays(now, parsed);

      if (mins < 60) return `${mins}m atrás`;
      if (hours < 24) return `${hours}h atrás`;
      if (days < 7) return `${days}d atrás`;
      return `${Math.floor(days / 7)}w atrás`;
    } catch {
      return time;
    }
  };

  const getBadgeClass = (time: string) => {
    try {
      const days = differenceInDays(new Date(), parseISO(time));
      const hours = differenceInHours(new Date(), parseISO(time));

      if (hours < 24) return "bg-blue-500/20 text-blue-400";
      if (days <= 2) return "bg-yellow-500/20 text-yellow-600";
      if (days <= 6) return "bg-orange-500/20 text-orange-500";
      return "bg-red-500/20 text-red-500";
    } catch {
      return "bg-gray-500/20 text-gray-400";
    }
  };

  const formatDescription = (desc: string) => {
    const pattern = /(Top 3 procesos que activan la alerta:|Los 3 procesos principales que activan la alerta:)/;
    const match = desc.match(pattern);

    if (!match) {
      return <p className="text-gray-300 whitespace-pre-line text-sm">{desc}</p>;
    }

    const [mainMsgRaw, , processListRaw] = desc.split(pattern);
    const normalized = processListRaw?.replace(/ y /g, ", ") || "";

    const processRegex = /([A-Za-z0-9.\-_: ]+): ([\d,]+\.\d+ MB)/g;
    const matches = Array.from(normalized.matchAll(processRegex)).map(([, name, value]) => ({
      name: name.trim(),
      value,
      valueMB: parseFloat(value.replace(/,/g, ''))
    }));

    const sortedProcesses = matches.sort((a, b) => b.valueMB - a.valueMB);

    return (
      <div className="space-y-2">
        <p className="text-white text-sm leading-snug">{mainMsgRaw.trim()}</p>
        <ul className="pl-4 list-disc space-y-0.5 text-sm text-gray-300">
          {sortedProcesses.map((proc, i) => (
            <li key={i}>
              <span className="text-white">{proc.name}</span>{": "}
              <span className="font-mono">{proc.value}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const AlertIcon = useMemo(() => {
    const d = description.toLowerCase();
    if (d.includes("disco")) return HardDrive;
    if (d.includes("memoria")) return MemoryStick;
    return isCritical ? ServerCrash : Info;
  }, [description, isCritical]);

  const StatusBadge = ({ text, color }: { text: string, color: string }) => (
    <div className={`text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${color}`}>
      <span className={`w-2 h-2 rounded-full bg-current`} />
      {text}
    </div>
  );

  return (
    <DashboardCard
      highlightBorder
      highlightColor={isCritical ? 'border-red-500 animate-glow-pulse rounded-lg' : 'border-yellow-500'}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="flex items-center gap-2 text-white text-base font-semibold">
          <AlertIcon className={isCritical ? 'w-5 h-5 text-red-500' : 'w-5 h-5 text-yellow-500'} />
          {title}
        </h3>

        <div className="flex flex-wrap gap-2 items-center justify-end">
          <StatusBadge
            text={isCritical ? 'Crítico' : 'Advertencia'}
            color={isCritical
              ? 'text-red-500 bg-red-500/10 animate-glow-pulse'
              : 'text-yellow-600 bg-yellow-500/10'}
          />

          {resolved && (
            <div className="text-xs px-2 py-0.5 rounded-full font-semibold text-green-500 bg-green-500/10 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Resuelto
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        {formatDescription(description)}

        <div className="flex justify-between text-xs items-center mt-3 flex-wrap gap-y-1">
          <span className="text-gray-400 inline-flex items-center gap-1">
            <ClockAlert className="w-4 h-4 text-blue-200" />
            <span>Reportado desde:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getBadgeClass(startTime)}`}>
              {getCompactTimeAgo(startTime)}
            </span>
          </span>

          <a
            href={`https://app.atera.com/new/rmm/device/${deviceGuid}/agent`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:text-primary-light hover:underline flex items-center gap-1"
          >
            Ver en Atera
            <ExternalLinkIcon className="h-3 w-3" />
          </a>
        </div>
      </div>
    </DashboardCard>
  );
};

export default AteraCard;
