import { motion } from "framer-motion";

interface StatusSummaryProps {
  critical: number;
  warning: number;
  operational: number;
  countdown: number;
  className?: string;
}

const StatusSummary = ({ critical, warning, operational, countdown, className = "" }: StatusSummaryProps) => {
  return (
    <div className={`flex justify-between items-center text-sm text-gray-400 bg-background/30 backdrop-blur-sm p-3 rounded-lg ${className}`}>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center">
          <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
          <span>Crítico: {critical}</span>
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
          <span>Advertencia: {warning}</span>
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          <span>Operacional: {operational}</span>
        </div>
      </div>
      
      <div>
        <span>
          Próxima actualización en <motion.span 
            key={countdown}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {countdown}s
          </motion.span>
        </span>
      </div>
    </div>
  );
};

export default StatusSummary;
