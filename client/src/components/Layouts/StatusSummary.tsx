import { motion } from "framer-motion";

interface StatusSummaryProps {
  critical: number;
  warning: number;
  operational: number;
  countdown: number;
}

const StatusSummary = ({ critical, warning, operational, countdown }: StatusSummaryProps) => {
  return (
    <footer className="mt-8 pt-6 border-t border-gray-800 flex justify-between items-center text-sm text-gray-400">
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          <span>Critical: {critical}</span>
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
          <span>Warning: {warning}</span>
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          <span>Operational: {operational}</span>
        </div>
      </div>
      
      <div>
        <span>
          Next refresh in <motion.span 
            key={countdown}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {countdown}s
          </motion.span>
        </span>
      </div>
    </footer>
  );
};

export default StatusSummary;
