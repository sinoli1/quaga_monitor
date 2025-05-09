import { useState, useEffect } from "react";
import { Radio } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import TabNavigation from "@/components/Dashboard/TabNavigation";
import UptimeRobotColumn from "@/components/Columns/UptimeRobotColumn";
import AteraColumn from "@/components/Columns/AteraColumn";
import ArubaColumn from "@/components/Columns/ArubaColumn";
import ExternalServicesColumn from "@/components/Columns/ExternalServicesColumn";
import BackupAlertsColumn from "@/components/Columns/BackupAlertsColumn";
import StatusSummary from "@/components/Layouts/StatusSummary";
import { usePolling } from "@/hooks/usePolling";
import { StatusSummary as StatusSummaryType, BackupAlerts } from "@/types";

const tabs = [
  { id: "infrastructure", label: "Infrastructure Status" },
  { id: "services", label: "Services & Alerts" },
];

function Dashboard() {
  const [location, setLocation] = useLocation();
  const tabFromPath = location === "/tab2" ? "services" : "infrastructure";
  const [activeTab, setActiveTab] = useState(tabFromPath);

  useEffect(() => {
    // Si la ruta es raíz, redirigir a /tab1
    if (location === "/") {
      setLocation("/tab1", { replace: true });
    }
  }, [location, setLocation]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setLocation(tabId === "services" ? "/tab2" : "/tab1");
  };

  const uptimeQuery = usePolling("/uptime");
  const ateraQuery = usePolling("/atera");
  const arubaQuery = usePolling("/aruba");
  const externalServicesQuery = usePolling("/rss");
  const backupAlertsQuery = usePolling("/gmail");

  const computeStatusSummary = (): StatusSummaryType => {
    let critical = 0;
    let warning = 0;
    let operational = 0;

    // External services
    const services = externalServicesQuery.data?.services || {};
    for (const key in services) {
      services[key] === "Up" ? operational++ : critical++;
    }

    // Uptime Robot
    const monitors = uptimeQuery.data?.monitors || [];
    monitors.forEach((monitor) => {
      const { monitor_down: down, monitor_total: total } = monitor;
      if (down === total && total > 0) critical += down;
      else if (down > 0) warning += down;
    });

    // Atera
    const alerts = Object.values(ateraQuery.data?.alerts || {});
    alerts.forEach((alert) => {
      alert.Title === "Machine status unknown" ? critical++ : warning++;
    });

    // Aruba
    const arubaSites = arubaQuery.data?.data || [];
    arubaSites.forEach((site) => {
      if (site.total_devices_problem === site.total_devices && site.total_devices > 0) critical++;
      else if (site.total_devices_problem > 0) warning++;
    });

    // Backup Alerts
    const backupData = backupAlertsQuery.data as BackupAlerts;
    for (const client in backupData || {}) {
      const state = backupData[client].Estado;
      if (state.includes("Failed")) critical++;
      else if (state.includes("Warning")) warning++;
    }

    return { critical, warning, operational };
  };

  const statusSummary = computeStatusSummary();

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen w-full">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <Radio className="w-6 h-6 mr-2 text-orange-300 drop-shadow-md" />
            <span className="text-transparent bg-gradient-to-r from-blue-300 to-orange-300 bg-clip-text">
              QUAGA Monitor
            </span>
            <span className="ml-2 text-xs px-2 py-1 rounded-md text-white bg-gradient-to-r from-o-500 to-orange-500 shadow-sm">
              Live
            </span>
          </h1>

          {/* Summary */}
          <StatusSummary
            critical={statusSummary.critical}
            warning={statusSummary.warning}
            operational={statusSummary.operational}
            countdown={uptimeQuery.secondsUntilRefetch}
            className="mb-4"
          />
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
