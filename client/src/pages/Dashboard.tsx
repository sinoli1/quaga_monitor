import { useState, useEffect, useRef } from "react";
import { AlertCircle, AlertTriangle, RefreshCcw } from "lucide-react";
import logo from "@/assets/images/logo.png";
import alertSound from "@/assets/sound/sound.mp3";
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

  /* 
    Calculamos los estados críticos por servicio para disparar la alerta sonora
    independientemente de cada uno.
  */
  const computeCriticalCounts = () => {
    let uptimeCritical = 0;
    let ateraCritical = 0;
    let arubaCritical = 0;

    // UptimeRobot Monitors
    const monitors = uptimeQuery.data?.monitors || [];
    monitors.forEach((monitor) => {
      const { monitor_down: down, monitor_total: total } = monitor;
      if (down === total && total > 0) {
        uptimeCritical++;
      }
    });

    // Atera Alerts
    const alerts = Object.values(ateraQuery.data?.alerts || {});
    alerts.forEach((alert) => {
      if (alert.Title === "Machine status unknown") {
        ateraCritical++;
      }
    });

    // Aruba Sites
    const arubaSites = arubaQuery.data?.data || [];
    arubaSites.forEach((site) => {
      if (site.total_devices_problem === site.total_devices && site.total_devices > 0) {
        arubaCritical++;
      }
    });

    return { uptime: uptimeCritical, atera: ateraCritical, aruba: arubaCritical };
  };

  const criticalCounts = computeCriticalCounts();
  const prevCriticalCountsRef = useRef({ uptime: 0, atera: 0, aruba: 0 });

  useEffect(() => {
    const { uptime, atera, aruba } = criticalCounts;
    const prev = prevCriticalCountsRef.current;

    // Reproducir sonido si incrementa la cantidad de críticos en cualquiera de los servicios
    if (
      uptime > prev.uptime ||
      atera > prev.atera ||
      aruba > prev.aruba
    ) {
      const audio = new Audio(alertSound);
      audio.play().catch((error) => console.log("Audio play failed", error));
    }
    prevCriticalCountsRef.current = criticalCounts;
  }, [criticalCounts.uptime, criticalCounts.atera, criticalCounts.aruba]);

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
                  alt="Quaga - Tecnologia para Pymes"
                  className="h-12 md:h-20"
                />
              </h1>
            </div>

            {/* Status Summary */}
            <div className="hidden md:flex gap-3 w-full md:w-auto">

              {/* Countdown */}
              <div className="flex items-center gap-2 border border-blue/30 text-primary px-4 py-2 rounded-xl shadow-sm hover:bg-primary/20 transition">
                <RefreshCcw className="w-4 h-4" />
                <span className="uppercase text-xs tracking-wide">Proxima actualizacion en: </span>
                <motion.span
                  key={uptimeQuery.secondsUntilRefetch}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="font-bold text-white"
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
