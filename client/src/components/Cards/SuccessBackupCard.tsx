// components/Cards/SuccessBackupCard.tsx (Crea este nuevo archivo)

import DashboardCard from "@/components/Dashboard/Card";
import { CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface SuccessBackupCardProps {
  clientName: string;
  status: string;
  sentDate: string;
}

const formatSuccessDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        // Formato dd/MM HH:mm (más compacto)
        return format(date, "dd/MM HH:mm", { locale: es });
    } catch {
        return dateString;
    }
}

const SuccessBackupCard = ({ clientName, status, sentDate }: SuccessBackupCardProps) => {
  return (
    <DashboardCard className="p-3 flex items-center justify-between border-l-4 border-green-500 min-h-[50px]">
      
      {/* Columna 1: Nombre y Éxito */}
      <div className="flex flex-col gap-0.5 min-w-0 pr-2">
        <span className="text-sm font-medium text-white truncate">
          {clientName}
        </span>
        <div className="flex items-center gap-1 text-xs text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            <span className="font-semibold">{status}</span>
        </div>
      </div>

      {/* Columna 2: Hora (Badge) */}
      <div className="flex-shrink-0 flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold text-green-700 bg-green-300/20 whitespace-nowrap">
          <Clock className="w-3 h-3" />
          {formatSuccessDate(sentDate)}
      </div>
    </DashboardCard>
  );
};

export default SuccessBackupCard;