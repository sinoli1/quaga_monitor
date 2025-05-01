import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import { motion, AnimatePresence } from "framer-motion";
import { format, parseISO } from "date-fns";

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
  // Determine status badge class
  const getStatusClass = (status: string) => {
    if (status.toLowerCase().includes('failed')) {
      return 'status-error';
    } else if (status.toLowerCase().includes('warning')) {
      return 'status-warning';
    } else {
      return 'status-unknown';
    }
  };

  // Format the sent date
  const formatSentDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, "MMM d, h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  return (
    <DashboardCard>
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-medium">{clientName}</h3>
        <div className={`status-badge ${getStatusClass(status)}`}>
          <span className="status-badge-dot"></span>
          {status}
        </div>
      </div>
      <div className="space-y-2 text-sm">
        <p className="text-gray-400">
          <span className="font-medium text-white">Sent:</span> {formatSentDate(sentDate)}
        </p>
        <p className="text-gray-400">{isExpanded ? fullBody.substring(0, 100) + '...' : summary}</p>
      </div>
      
      <div className="mt-3">
        <button 
          className="text-xs text-primary hover:text-primary-light flex items-center"
          onClick={onToggleExpand}
        >
          {isExpanded ? 'Hide details' : 'Show details'}
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
              <div className="mt-3 p-3 bg-background/50 rounded-lg text-xs text-gray-400">
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
