import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import TabNavigation from "@/components/Dashboard/TabNavigation";
import UptimeRobotColumn from "@/components/Columns/UptimeRobotColumn";
import AteraColumn from "@/components/Columns/AteraColumn";
import ArubaColumn from "@/components/Columns/ArubaColumn";
import ExternalServicesColumn from "@/components/Columns/ExternalServicesColumn";
import BackupAlertsColumn from "@/components/Columns/BackupAlertsColumn";
import StatusSummary from "@/components/Layouts/StatusSummary";
import { usePolling } from "@/hooks/usePolling";
import { useWebSocket } from "@/hooks/useWebSocket";
import { 
  StatusSummary as StatusSummaryType, 
  BackupAlerts, 
  WebSocketMonitoringData 
} from "@/types";

const tabs = [
  { id: "infrastructure", label: "Estado de Infraestructura" },
  { id: "services", label: "Servicios y Alertas" },
];

function Dashboard() {
  const [activeTab, setActiveTab] = useState("infrastructure");
  const [wsData, setWsData] = useState<WebSocketMonitoringData | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());
  
  // Use regular polling as fallback
  const uptimeQuery = usePolling("/uptime");
  const ateraQuery = usePolling("/atera");
  const arubaQuery = usePolling("/aruba");
  const externalServicesQuery = usePolling("/rss");
  const backupAlertsQuery = usePolling("/gmail");
  
  // Use WebSocket for real-time updates
  const { status: wsStatus, lastMessage } = useWebSocket();
  
  // Update data with WebSocket messages
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'update' && lastMessage.data) {
      setWsData(lastMessage.data);
      setLastUpdated(new Date().toLocaleTimeString());
      setCountdown(30); // Reset countdown
    }
  }, [lastMessage]);
  
  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Get effective data, preferring WebSocket data if available
  const getEffectiveData = () => {
    return {
      uptime: wsData?.uptime || uptimeQuery.data,
      atera: wsData?.atera || ateraQuery.data,
      aruba: wsData?.aruba || arubaQuery.data,
      rss: wsData?.rss || externalServicesQuery.data,
      gmail: wsData?.gmail || backupAlertsQuery.data,
    };
  };
  
  // Compute status summary
  const computeStatusSummary = (): StatusSummaryType => {
    let critical = 0;
    let warning = 0;
    let operational = 0;
    
    const data = getEffectiveData();
    
    // Count services in external services
    if (data.rss) {
      const services = data.rss.services || {};
      Object.keys(services).forEach(service => {
        if (services[service] === 'Up') operational++;
        else critical++;
      });
    }
    
    // Count uptime monitors
    if (data.uptime && Array.isArray(data.uptime)) {
      data.uptime.forEach((monitor) => {
        Object.keys(monitor.monitors_id || {}).forEach(monitorId => {
          if (monitor.monitors_id[monitorId].status === 'Down') critical++;
          else if (monitor.monitors_id[monitorId].status === 'Unknown') warning++;
        });
      });
    }
    
    // Count atera alerts
    if (data.atera && Array.isArray(data.atera)) {
      data.atera.forEach((alert) => {
        if (alert.AlertMessage.includes("Machine status unknown")) warning++;
        else critical++;
      });
    }
    
    // Count aruba devices
    if (data.aruba && Array.isArray(data.aruba)) {
      data.aruba.forEach((site) => {
        critical += site.total_devices_problem;
        operational += site.total_devices - site.total_devices_problem;
      });
    }
    
    // Count backup alerts
    if (data.gmail) {
      const backupData = data.gmail as BackupAlerts;
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
            countdown={countdown}
            className="mb-4"
          />
          
          {/* WebSocket status indicator */}
          <div className="text-xs text-gray-500 mb-2 flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              wsStatus === 'connected' ? 'bg-green-500' : 
              wsStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span>
              WebSocket: {wsStatus === 'connected' ? 'Conectado' : 
                         wsStatus === 'connecting' ? 'Conectando...' : 'Desconectado'}
            </span>
          </div>
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
              <UptimeRobotColumn 
                data={getEffectiveData().uptime} 
                isLoading={!wsData && uptimeQuery.isLoading} 
                error={uptimeQuery.error} 
              />
              <AteraColumn 
                data={getEffectiveData().atera} 
                isLoading={!wsData && ateraQuery.isLoading} 
                error={ateraQuery.error} 
              />
              <ArubaColumn 
                data={getEffectiveData().aruba} 
                isLoading={!wsData && arubaQuery.isLoading} 
                error={arubaQuery.error} 
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ExternalServicesColumn 
                data={getEffectiveData().rss} 
                isLoading={!wsData && externalServicesQuery.isLoading} 
                error={externalServicesQuery.error}
              />
              <BackupAlertsColumn 
                data={getEffectiveData().gmail} 
                isLoading={!wsData && backupAlertsQuery.isLoading} 
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
