import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, CheckCircle, TimerReset } from "lucide-react";

interface StatusSummaryProps {
  critical: number;
  warning: number;
  operational: number;
  countdown: number;
  className?: string;
}

const StatusSummary = ({
  critical,
  warning,
  operational,
  countdown,
  className = "",
}: StatusSummaryProps) => {
  return (
    <div className={`flex justify-between items-center text-sm text-gray-300 bg-background/30 backdrop-blur-sm p-3 rounded-lg ${className}`}>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-1">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-white font-medium">Critical:</span> {critical}
        </div>
        <div className="flex items-center gap-1">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <span className="text-white font-medium">Warning:</span> {warning}
        </div>
        <div className="flex items-center gap-1">
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span className="text-white font-medium">Operational:</span> {operational}
        </div>
      </div>

      <div className="flex items-center gap-1 text-xs text-gray-400">
        <TimerReset className="w-4 h-4 text-primary" />
        <span className="font-medium">Next update in</span>
        <motion.span
          key={countdown}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="text-white font-semibold"
        >
          {countdown}s
        </motion.span>
      </div>
    </div>
  );
};

export default StatusSummary;
