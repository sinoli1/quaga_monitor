import {
  ChevronDownIcon,
  ChevronUpIcon,
  MailX,
  Send,
  MessageSquareWarning,
  MailOpen,
} from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";
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
  onToggleExpand
}: BackupAlertCardProps) => {
  const getStatusClass = (status: string) => {
    if (status.toLowerCase().includes("failed")) return "status-error";
    if (status.toLowerCase().includes("warning")) return "status-warning";
    return "status-unknown";
  };

  const formatSentDate = (dateString: string) => {
    try {
      const date = new Date(dateString); // más permisivo que parseISO
      return format(date, "HH:mm '-' dd'/'MM'/'yy", { locale: es });
    } catch {
      return dateString;
    }
  };

  return (
    <DashboardCard>
      <div className="flex justify-between items-start mb-3">
      <h3 className="text-xl font-medium flex items-center gap-1">
  <MailX className="w-5 h-5 text-red-300" />
  {clientName}
</h3>
        <div className={`status-badge ${getStatusClass(status)}`}>
          <span className="status-badge-dot" />
          {status}
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <p className="text-gray-400 flex items-center gap-1">
          <Send className="w-4 h-4 text-blue-200"/>
          <span className="font-medium text-white">Sent:</span> <span className="text-sm text-blue-400 bg-blue-500/20 px-2 py-0.5 rounded-full">{formatSentDate(sentDate)}</span>
        </p>
        <p className="text-gray-400 flex items-center gap-1">
          <MessageSquareWarning className="w-4 h-4 text-blue-200" />
          {isExpanded ? fullBody.substring(0, 100) + "..." : summary}
        </p>
      </div>

      <div className="mt-3">
        <button
          className="text-xs text-primary hover:text-primary-light flex items-center"
          onClick={onToggleExpand}
        >
          {isExpanded ? "Hide details" : "Show details"}
          {isExpanded ? (
            <ChevronUpIcon className="ml-1 h-4 w-4" />
          ) : (
            <ChevronDownIcon className="ml-1 h-4 w-4" />
          )}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-3 bg-background/50 rounded-lg text-xs text-gray-400 flex gap-2">
                <MailOpen className="w-4 h-4 text-primary mt-0.5" />
                <p>{fullBody}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardCard>
  );
};

export default BackupAlertCard;
