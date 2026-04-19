import { Card } from "@/components/ui/card";
import { ReactNode } from "react";
import { motion } from "framer-motion";

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
  highlightBorder?: boolean;
  highlightColor?: string;
  variant?: "default" | "warning" | "critical" | "success";
}

const DashboardCard = ({
  children,
  className = "",
  highlightBorder = false,
  highlightColor = "border-yellow-500/30",
  variant = "default",
}: DashboardCardProps) => {
  const variantClass = {
    default: "glass-card",
    warning: "glass-card-warning",
    critical: "glass-card-critical",
    success: "glass-card-success",
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9 }}
    >
      <Card
        className={`${variantClass} rounded-2xl p-5 shadow-xl transition-all duration-300 ease-in-out ${
          highlightBorder ? `border ${highlightColor}` : ""
        } ${className}`}
      >
        {children}
      </Card>
    </motion.div>
  );
};

export default DashboardCard;
