import { Card } from "@/components/ui/card";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  highlightBorder?: boolean;
  highlightColor?: string;
}

const DashboardCard = ({ 
  children, 
  className = "", 
  highlightBorder = false,
  highlightColor = "border-yellow-500/30"
}: DashboardCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className={`glass-card rounded-xl p-4 shadow-lg ${highlightBorder ? `border ${highlightColor}` : ''} ${className}`}
      >
        {children}
      </Card>
    </motion.div>
  );
};

export default DashboardCard;
