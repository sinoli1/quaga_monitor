import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  TimerReset,
} from "lucide-react";

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
    <div
      className={`flex justify-between items-center text-sm text-gray-300 bg-background/30 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-sm ${className}`}
    >
      {/* Status Group */}
      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="uppercase text-xs text-white/70 tracking-wide">
            Critical:
          </span>
          <span className="text-white font-semibold">{critical}</span>
        </div>

        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <span className="uppercase text-xs text-white/70 tracking-wide">
            Warning:
          </span>
          <span className="text-white font-semibold">{warning}</span>
        </div>
      </div>

      {/* Countdown */}
      <div className="flex items-center gap-2 text-xs text-white/60">
        <TimerReset className="w-4 h-4 text-primary" />
        <span className="uppercase tracking-wider">Next update in</span>
        <motion.span
          key={countdown}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-white font-bold"
        >
          {countdown}s
        </motion.span>
      </div>
    </div>
  );
};

export default StatusSummary;
