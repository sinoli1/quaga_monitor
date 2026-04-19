import {
  ChevronDownIcon,
  ChevronUpIcon,
  DatabaseZap, 
  Clock,
  AlertTriangle,
} from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface BackupAlertCardProps {
  clientName: string;
  status: string;
  sentDate: string;
  summary: string;
  fullBody: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

const BackupAlertCard = ({
  clientName,
  status,
  sentDate,
  summary,
  fullBody,
  isExpanded,
  onToggleExpand,
}: BackupAlertCardProps) => {

  const isFailed = status.toLowerCase().includes("failed");
  const alertColor = isFailed ? "text-red-500" : "text-gray-400";
  const dateColor = isFailed ? "text-red-400" : "text-gray-400";
  
  const formatSentDate = (dateString: string) => {
    try {
      const cleanDate = dateString.replace(/\s*\(.*?\)$/, "");
      const date = new Date(cleanDate);
      return format(date, "dd/MM HH:mm", { locale: es });
    } catch {
      return dateString;
    }
  };

  const getSummaryDisplay = (text: string) => {
    if (isExpanded) {
        return <p className="whitespace-pre-wrap text-gray-300 text-sm leading-snug">{fullBody}</p>;
    }
    
    // Obtener la primera línea o truncar
    const maxSummaryLength = 100;
    let shortText = text.split('\n')[0].trim();
    
    if (fullBody.length > maxSummaryLength) {
        shortText = shortText.substring(0, maxSummaryLength).trim() + "...";
    }

    return <p className="text-gray-400 text-sm leading-snug">{shortText}</p>;
  };

  // Se asume una altura aproximada para el resumen de 3 líneas de texto (text-sm leading-snug)
  // Calculamos la altura necesaria para 3 líneas + el padding/margin del subtítulo.
  const baseContentHeightClass = isExpanded ? '' : 'min-h-[4rem]'; 
    // 4rem (approx 64px) cubre el espacio de 3 líneas y asegura simetría.


  return (
    // min-h es ahora más consistente.
    <DashboardCard className="min-h-[160px] flex flex-col justify-between p-4"> 
      
      {/* 1. HEADER (Título y Horario) */}
      <header className={`grid grid-cols-3 gap-2 pb-2 mb-2 border-b border-gray-700/50`}>
        
        {/* COLUMNA 1: TÍTULO */}
        <div className="flex items-center gap-2 col-span-2">
          <DatabaseZap className={`w-5 h-5 shrink-0 ${alertColor}`} /> 
          <h3 className="text-base font-bold text-white leading-tight truncate">
            {clientName.toUpperCase()}
          </h3>
        </div>
        
        {/* COLUMNA 2: HORARIO (Énfasis: Badge con Clock) */}
        <div className={`flex justify-end items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${dateColor} bg-red-400/10 leading-none`}>
            <Clock className="w-3 h-3" />
            {formatSentDate(sentDate)}
        </div>
      </header>

      {/* 2. BODY (Subtítulo y Descripción) */}
      <div className={`text-sm flex-grow pb-2 mb-2 border-b border-gray-700/50 pl-0`}>
        
        {/* Subtítulo: Fallo de Copia de Respaldo */}
        <p className={`flex items-center gap-1.5 text-xs font-semibold mb-1 ${dateColor}`}>
             <AlertTriangle className="w-3 h-3" />
             FALLO DE COPIA DE RESPALDO
        </p>

        {/* Descripción Animada (Aplica min-h si no está expandido) */}
        <AnimatePresence mode="wait">
            <motion.div
              key={isExpanded ? "expanded" : "summary"} 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`overflow-hidden ${baseContentHeightClass}`}
            >
              {getSummaryDisplay(summary)}
            </motion.div>
        </AnimatePresence>
      </div>

      {/* 3. FOOTER (Botón Ver Completo) */}
      <footer className="mt-auto"> 
        <button
          className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium transition-colors text-xs"
          onClick={onToggleExpand}
        >
          {isExpanded ? "Ocultar mensaje completo" : "Ver mensaje completo"}
          {isExpanded ? (
            <ChevronUpIcon className="w-3.5 h-3.5" />
          ) : (
            <ChevronDownIcon className="w-3.5 h-3.5" />
          )}
        </button>
      </footer>
    </DashboardCard>
  );
};

export default BackupAlertCard;