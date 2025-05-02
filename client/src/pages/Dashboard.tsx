import { useState } from "react";
import { motion } from "framer-motion";
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
  { id: "infrastructure", label: "Estado de Infraestructura" },
  { id: "services", label: "Servicios y Alertas" },
];

function Dashboard() {
  const [activeTab, setActiveTab] = useState("infrastructure");
  const uptimeQuery = usePolling("/uptime");
  const ateraQuery = usePolling("/atera");
  const arubaQuery = usePolling("/aruba");
  const externalServicesQuery = usePolling("/rss");
  const backupAlertsQuery = usePolling("/gmail");

  const lastUpdated = new Date().toLocaleTimeString();
  
  // Compute status summary
  const computeStatusSummary = (): StatusSummaryType => {
    let critical = 0;
    let warning = 0;
    let operational = 0;
    
    // Count services in external services
    if (externalServicesQuery.data) {
      const services = externalServicesQuery.data.services || {};
      Object.keys(services).forEach(service => {
        if (services[service] === 'Up') operational++;
        else critical++;
      });
    }
    
    // Count uptime monitors
    if (uptimeQuery.data && Array.isArray(uptimeQuery.data)) {
      uptimeQuery.data.forEach((monitor) => {
        Object.keys(monitor.monitors_id || {}).forEach(monitorId => {
          if (monitor.monitors_id[monitorId].status === 'Down') critical++;
          else if (monitor.monitors_id[monitorId].status === 'Unknown') warning++;
        });
      });
    }
    
    // Count atera alerts
    if (ateraQuery.data && Array.isArray(ateraQuery.data)) {
      ateraQuery.data.forEach((alert) => {
        if (alert.AlertMessage.includes("Machine status unknown")) warning++;
        else critical++;
      });
    }
    
    // Count aruba devices
    if (arubaQuery.data && Array.isArray(arubaQuery.data)) {
      arubaQuery.data.forEach((site) => {
        critical += site.total_devices_problem;
        operational += site.total_devices - site.total_devices_problem;
      });
    }
    
    // Count backup alerts
    if (backupAlertsQuery.data) {
      const backupData = backupAlertsQuery.data as BackupAlerts;
      Object.keys(backupData).forEach(client => {
        if (backupData[client].Estado.includes("Failed")) critical++;
        else if (backupData[client].Estado.includes("Warning")) warning++;
      });
    }
    
    return { critical, warning, operational };
  };
  
  const statusSummary = computeStatusSummary();

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen w-full">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 flex items-center">
            <span className="text-primary mr-2">Monitoreo de Servicios</span>
            <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-md ml-2">EN VIVO</span>
          </h1>
          <div className="flex items-center text-sm text-gray-400 mb-4">
            <span className="flex items-center">
              <span className="h-2 w-2 bg-secondary rounded-full animate-pulse mr-2"></span>
              <span>Última actualización: {lastUpdated}</span>
            </span>
          </div>
          
          {/* Status Summary at top */}
          <StatusSummary 
            critical={statusSummary.critical}
            warning={statusSummary.warning}
            operational={statusSummary.operational}
            countdown={uptimeQuery.secondsUntilRefetch}
            className="mb-4"
          />
        </header>

        <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        <motion.div
          key={activeTab}
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          className="mt-6"
        >
          {activeTab === "infrastructure" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <UptimeRobotColumn data={uptimeQuery.data} isLoading={uptimeQuery.isLoading} error={uptimeQuery.error} />
              <AteraColumn data={ateraQuery.data} isLoading={ateraQuery.isLoading} error={ateraQuery.error} />
              <ArubaColumn data={arubaQuery.data} isLoading={arubaQuery.isLoading} error={arubaQuery.error} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ExternalServicesColumn 
                data={externalServicesQuery.data} 
                isLoading={externalServicesQuery.isLoading} 
                error={externalServicesQuery.error}
              />
              <BackupAlertsColumn 
                data={backupAlertsQuery.data} 
                isLoading={backupAlertsQuery.isLoading} 
                error={backupAlertsQuery.error}
              />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
