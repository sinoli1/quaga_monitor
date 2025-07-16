import {
  ChevronDownIcon,
  ChevronUpIcon,
  MailX,
} from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useState } from "react";

interface BackupAlertCardProps {
  clientName: string;
  status: string;
  sentDate: string;
  summary: string;
  fullBody: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  successList?: { clientName: string; status: string; sentDate: string }[];
}

const BackupAlertCard = ({
  clientName,
  status,
  sentDate,
  summary,
  fullBody,
  isExpanded,
  onToggleExpand,
  successList = [],
}: BackupAlertCardProps) => {
  const [showSuccessList, setShowSuccessList] = useState(false);

  const getStatusColor = (status: string) => {
    const lower = status.toLowerCase();
    if (lower.includes("failed")) return "text-red-500 border-red-500";
    if (lower.includes("warning")) return "text-yellow-500 border-yellow-500";
    return "text-gray-500 border-gray-500";
  };

  const formatSentDate = (dateString: string) => {
    try {
      const cleanDate = dateString.replace(/\s*\(.*?\)$/, "");
      const date = new Date(cleanDate);
      return format(date, "dd/MM HH:mm", { locale: es });
    } catch {
      return dateString;
    }
  };

  return (
    <DashboardCard>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2 text-indigo-300">
          <MailX className="w-5 h-5" />
          <h3 className="text-lg font-semibold text-white">
            {clientName.toUpperCase()}
          </h3>
        </div>
        <span className={`border-l-4 pl-2 text-sm font-medium ${getStatusColor(status)}`}>
          {formatSentDate(sentDate)}
        </span>
      </div>

      <div className="text-sm text-gray-400">
        {!isExpanded ? (
          <p>
            {summary.length > 120 ? summary.substring(0, 120) + "..." : summary}
          </p>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="whitespace-pre-wrap">{fullBody}</p>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <div className="mt-3">
        <button
          className="text-xs text-indigo-400 hover:underline flex items-center"
          onClick={onToggleExpand}
        >
          {isExpanded ? "Ocultar detalles" : "Ver mensaje completo"}
          {isExpanded ? (
            <ChevronUpIcon className="ml-1 w-4 h-4" />
          ) : (
            <ChevronDownIcon className="ml-1 w-4 h-4" />
          )}
        </button>
      </div>

      {successList.length > 0 && (
        <div className="mt-6 border-t border-gray-700 pt-4">
          <button
            className="text-xs text-green-400 hover:underline flex items-center"
            onClick={() => setShowSuccessList((prev) => !prev)}
          >
            {showSuccessList ? "Ocultar respaldos exitosos" : "Ver respaldos exitosos"}
            {showSuccessList ? (
              <ChevronUpIcon className="ml-1 w-4 h-4" />
            ) : (
              <ChevronDownIcon className="ml-1 w-4 h-4" />
            )}
          </button>

          <AnimatePresence>
            {showSuccessList && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden text-sm text-gray-300 mt-3 space-y-1"
              >
                {successList.map((item, i) => (
                  <li
                    key={i}
                    className="flex flex-wrap justify-between gap-2 border-b border-gray-700 py-1"
                  >
                    <span className="flex-1 min-w-[120px]">{item.clientName}</span>
                    <span className="text-green-400 font-medium">{item.status}</span>
                    <span className="text-xs">{formatSentDate(item.sentDate)}</span>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      )}
    </DashboardCard>
  );
};

export default BackupAlertCard;
