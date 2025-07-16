import { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle, TimerReset } from "lucide-react";
import logo from "@/assets/images/logo.png";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import TabNavigation from "@/components/Dashboard/TabNavigation";
import UptimeRobotColumn from "@/components/Columns/UptimeRobotColumn";
import AteraColumn from "@/components/Columns/AteraColumn";
import ArubaColumn from "@/components/Columns/ArubaColumn";
import ExternalServicesColumn from "@/components/Columns/ExternalServicesColumn";
import BackupAlertsColumn from "@/components/Columns/BackupAlertsColumn";
import { usePolling } from "@/hooks/usePolling";
import { StatusSummary as StatusSummaryType, BackupAlerts } from "@/types";

const tabs = [
  { id: "infrastructure", label: "Infraestructura" },
  { id: "services", label: "Servicios y Backup" },
];

function Dashboard() {
  const [location, setLocation] = useLocation();
  const tabFromPath = location === "/tab2" ? "services" : "infrastructure";
  const [activeTab, setActiveTab] = useState(tabFromPath);

  useEffect(() => {
    if (location === "/") {
      setLocation("/tab1", { replace: true });
    }
  }, [location, setLocation]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setLocation(tabId === "services" ? "/tab2" : "/tab1");
  };

  // Queries (pueden seguir corriendo aunque no se muestren los datos)
  const uptimeQuery = usePolling("/uptime");
  const ateraQuery = usePolling("/atera");
  const arubaQuery = usePolling("/aruba");
  const externalServicesQuery = usePolling("/rss");
  const backupAlertsQuery = usePolling("/gmail");

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  const computeStatusSummary = (): StatusSummaryType => {
  let critical = 0;
  let warning = 0;
  let operational = 0;

  const services = externalServicesQuery.data?.services || {};
  for (const key in services) {
    services[key] === "Up" ? operational++ : critical++;
  }

  const monitors = uptimeQuery.data?.monitors || [];
  monitors.forEach((monitor) => {
    const { monitor_down: down, monitor_total: total } = monitor;
    if (down === total && total > 0) critical += down;
    else if (down > 0) warning += down;
  });

  const alerts = Object.values(ateraQuery.data?.alerts || {});
  alerts.forEach((alert) => {
    alert.Title === "Machine status unknown" ? critical++ : warning++;
  });

  const arubaSites = arubaQuery.data?.data || [];
  arubaSites.forEach((site) => {
    if (site.total_devices_problem === site.total_devices && site.total_devices > 0) critical++;
    else if (site.total_devices_problem > 0) warning++;
  });

  const backupData = backupAlertsQuery.data as BackupAlerts;
  for (const client in backupData || {}) {
    const state = backupData[client].Estado;
    if (state.includes("Failed")) critical++;
    else if (state.includes("Warning")) warning++;
  }

  return { critical, warning, operational };
};

const statusSummary = computeStatusSummary();

  return (
    <div className="min-h-screen w-full">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6">
  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
    {/* Logo */}
    <div className="flex justify-center md:justify-start w-full md:w-auto">
      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
        <img
          src={logo}
          alt="Logo de la empresa"
          className="h-12 md:h-20"
        />
      </h1>
    </div>

    {/* Status Summary */}
    <div className="hidden md:flex flex-col md:flex-row md:items-center gap-3 text-sm text-gray-300 bg-background/30 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-sm w-full md:w-auto text-center">
      <div className="flex items-center justify-center gap-2">
        <AlertCircle className="w-4 h-4 text-red-500" />
        <span className="uppercase text-xs text-white/70 tracking-wide">Crítico:</span>
        <span className="text-white font-semibold">{statusSummary.critical}</span>
      </div>

      <div className="hidden md:flex items-center justify-center gap-2">
        <AlertTriangle className="w-4 h-4 text-yellow-500" />
        <span className="uppercase text-xs text-white/70 tracking-wide">Advertencia:</span>
        <span className="text-white font-semibold">{statusSummary.warning}</span>
      </div>

      {/* Countdown solo en desktop */}
      <div className="hidden md:flex items-center gap-2 text-white/60">
        <TimerReset className="w-4 h-4 text-primary" />
        <span className="uppercase tracking-wider text-xs">Próxima actualización</span>
        <motion.span
          key={uptimeQuery.secondsUntilRefetch}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-white font-bold"
        >
          {uptimeQuery.secondsUntilRefetch}s
        </motion.span>
      </div>
    </div>
  </div>
</header>

        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <motion.div
          key={activeTab}
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          className="mt-6"
        >
          {activeTab === "infrastructure" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <UptimeRobotColumn {...uptimeQuery} />
              <AteraColumn {...ateraQuery} />
              <ArubaColumn {...arubaQuery} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ExternalServicesColumn {...externalServicesQuery} />
              <BackupAlertsColumn {...backupAlertsQuery} />
            </div>
          )}
        </motion.div>
      </div>
      
    </div>
    
  );
}

export default Dashboard;
