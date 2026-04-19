import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { parseISO, parse, differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';
import { RefreshIcon } from '@/components/Monitor/SvgIcons';
import Column from '@/components/Monitor/Column';
import UptimeCard from '@/components/Monitor/UptimeCard';
import AteraCard from '@/components/Monitor/AteraCard';
import ArubaCard from '@/components/Monitor/ArubaCard';
import ShowMore from '@/components/Monitor/ShowMore';
import ExternalServicesColumn from '@/components/Columns/ExternalServicesColumn';
import BackupAlertsColumn from '@/components/Columns/BackupAlertsColumn';
import { usePolling } from '@/hooks/usePolling';
import alertSound from '@/assets/sound/sound.mp3';
import logoImg from '@/assets/images/logo.png';

const tabs = [
  { id: 'infrastructure', label: 'Infraestructura' },
  { id: 'services', label: 'Servicios y Backup' },
];

/* =====================================================================
   HELPERS
   ===================================================================== */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatDuration(time: string): string {
  if (time === 'Unknown') return 'Desconocido';
  const daysMatch = time.match(/(\d+)\s+days?/);
  const timeMatch = time.match(/(\d+):(\d+):(\d+)/);
  const d = daysMatch ? `${daysMatch[1]}d` : '';
  const h = timeMatch ? `${parseInt(timeMatch[1])}h` : '';
  const m = timeMatch ? `${parseInt(timeMatch[2])}m` : '';
  return [d, h, m].filter(Boolean).join(' ') || time;
}

function formatSecondsToTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remainMins = mins % 60;
  if (hours < 24) return remainMins > 0 ? `${hours}h ${remainMins}m` : `${hours}h`;
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  return remainHours > 0 ? `${days}d ${remainHours}h` : `${days}d`;
}

function formatISOAgo(time: string): string {
  try {
    const now = new Date();
    const parsed = parseISO(time);
    const mins = differenceInMinutes(now, parsed);
    const hours = differenceInHours(now, parsed);
    const days = differenceInDays(now, parsed);
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h ${mins % 60}m`;
    return days > 0 ? (hours % 24 > 0 ? `${days}d ${hours % 24}h` : `${days}d`) : `${hours}h`;
  } catch { return time; }
}

function formatArubaAgo(dateStr: string): string {
  try {
    const parsed = parse(dateStr, "dd/MM/yyyy HH:mm:ss", new Date());
    const now = new Date();
    const mins = differenceInMinutes(now, parsed);
    const hours = differenceInHours(now, parsed);
    const days = differenceInDays(now, parsed);
    if (mins < 60) return `${mins}m`;
    if (hours < 24) return `${hours}h ${mins % 60}m`;
    return days > 0 ? (hours % 24 > 0 ? `${days}d ${hours % 24}h` : `${days}d`) : `${hours}h`;
  } catch { return dateStr; }
}

/* =====================================================================
   UPTIME DATA PROCESSING
   ===================================================================== */

interface UptimeSiteGroup {
  siteKey: string;
  clientName: string;
  siteName: string;
  initials: string;
  isps: Array<{
    name: string;
    status: string;
    url: string;
    lastDown: string;
    monitorId: string;
    statusUrl: string;
    tag?: string;
    tagClass?: string;
    hostname: string;
    type: string;
  }>;
}

function processUptimeData(data: any): { sites: UptimeSiteGroup[]; criticalCount: number; warningCount: number } {
  if (!data?.monitors) return { sites: [], criticalCount: 0, warningCount: 0 };

  const allMonitors = data.monitors.flatMap((monitor: any) => {
    const clientName = monitor.friendly_name;
    return Object.entries(monitor.monitors_id).map(([monitorId, details]: [string, any]) => ({
      clientName,
      monitorId,
      monitorName: details.friendly_name,
      status: details.status,
      url: details.url,
      lastDown: details.incidents[0]?.last_down || 'Unknown',
      statusUrl: monitor.custom_url + '/' + monitorId,
      custom_url: monitor.custom_url,
    }));
  });

  // Group by site (first 2 parts of monitorName split by " - ")
  const grouped: Record<string, typeof allMonitors> = {};
  allMonitors.forEach((m: any) => {
    const parts = m.monitorName.split(' - ');
    const key = parts.length >= 2 ? `${parts[0]} - ${parts[1]}` : parts[0];
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });

  let criticalCount = 0;
  let warningCount = 0;

  const sites: UptimeSiteGroup[] = Object.entries(grouped)
    .map(([siteKey, monitors]) => {
      const downMonitors = monitors.filter((m: any) => m.status === 'Down');
      if (downMonitors.length === 0) return null;

      const allDown = monitors.every((m: any) => m.status === 'Down');
      if (allDown) criticalCount++; else warningCount++;

      const parts = siteKey.split(' - ');
      const clientName = parts[0] || siteKey;
      const siteName = parts[1] || '';

      const isps = monitors.map((m: any, idx: number) => {
        const ispParts = m.monitorName.split(' - ');
        const ispName = ispParts.length >= 3 ? ispParts.slice(2).join(' - ') : ispParts[ispParts.length - 1];
        return {
          name: ispName.toUpperCase(),
          status: m.status,
          url: m.url,
          lastDown: m.lastDown,
          monitorId: m.monitorId,
          statusUrl: m.statusUrl,
          custom_url: m.custom_url,
          hostname: m.url,
          type: 'ISP',
        };
      });

      return {
        siteKey,
        clientName,
        siteName,
        initials: getInitials(clientName),
        isps,
      };
    })
    .filter(Boolean) as UptimeSiteGroup[];

  // Sort: critical first, then by longest downtime
  sites.sort((a, b) => {
    const aAllDown = a.isps.every(i => i.status === 'Down');
    const bAllDown = b.isps.every(i => i.status === 'Down');
    if (aAllDown !== bAllDown) return aAllDown ? -1 : 1;
    return 0;
  });

  return { sites, criticalCount, warningCount };
}

/* =====================================================================
   ATERA DATA PROCESSING
   ===================================================================== */

interface AteraCustomerGroup {
  customerName: string;
  initials: string;
  severity: 'critical' | 'orange' | 'warning';
  alerts: Array<{
    type: 'offline' | 'memory' | 'disk';
    deviceName: string;
    href: string;
    meta: string[];
    duration: string;
    diskBar?: { percent: number; fillClass: string };
  }>;
  badgeText: string;
  subtitle: string;
  reportedLabel: string;
  reportedTime: string;
}

function processAteraData(data: any): { customers: AteraCustomerGroup[]; offlineCount: number; memoryCount: number; diskCount: number } {
  if (!data?.alerts) return { customers: [], offlineCount: 0, memoryCount: 0, diskCount: 0 };

  const alertList = Object.values(data.alerts) as any[];
  let offlineCount = 0;
  let memoryCount = 0;
  let diskCount = 0;

  // Group by CustomerName
  const grouped: Record<string, any[]> = {};
  alertList.forEach((alert: any) => {
    const key = alert.CustomerName || 'Unknown';
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(alert);

    const titleLower = (alert.Title || '').toLowerCase();
    if (titleLower.includes('machine status unknown')) offlineCount++;
    else if (titleLower.includes('memory usage') || titleLower.includes('temperature')) memoryCount++;
    else if (titleLower.includes('disk usage')) diskCount++;
  });

  const customers: AteraCustomerGroup[] = Object.entries(grouped).map(([customerName, alerts]) => {
    let hasOffline = false;
    let hasMemory = false;
    let hasDisk = false;
    let offlineAlertCount = 0;
    let memAlertCount = 0;
    let diskAlertCount = 0;

    const processedAlerts = alerts.map((alert: any) => {
      const titleLower = (alert.Title || '').toLowerCase();
      let type: 'offline' | 'memory' | 'disk' = 'disk';
      let diskBar: { percent: number; fillClass: string } | undefined;

      if (titleLower.includes('machine status unknown')) {
        type = 'offline'; hasOffline = true; offlineAlertCount++;
      } else if (titleLower.includes('memory usage') || titleLower.includes('temperature')) {
        type = 'memory'; hasMemory = true; memAlertCount++;
        // Extract memory percentage from description
        const memMatch = (alert.AlertMessage || '').match(/Se están consumiendo ([\d.]+)\s*GB de ([\d.]+)\s*GB/i);
        if (memMatch) {
          const pct = Math.round((parseFloat(memMatch[1]) / parseFloat(memMatch[2])) * 100);
          diskBar = { percent: pct, fillClass: 'orange' };
        }
      } else if (titleLower.includes('disk usage')) {
        type = 'disk'; hasDisk = true; diskAlertCount++;
        // Extract disk info from HardwareDisks
        const driveMatch = alert.Title?.match(/Disk Usage\(([A-Z]:)\)/i);
        if (driveMatch && alert.HardwareDisks) {
          const drive = driveMatch[1].toUpperCase();
          const diskData = alert.HardwareDisks.find((d: any) => d.Drive?.toUpperCase() === drive);
          if (diskData) {
            const pct = Math.round((diskData.Used / diskData.Total) * 100);
            diskBar = { percent: pct, fillClass: 'warn' };
          }
        }
      }

      const duration = alert.incidents?.[0]?.created ? formatISOAgo(alert.incidents[0].created) : '?';

      // Build meta
      const meta: string[] = [];
      if (alert.IpAddress) meta.push(alert.IpAddress);
      if (alert.OS) {
        const shortOS = alert.OS.replace(/Professional/gi, 'Pro').replace(/Windows/gi, 'Win').replace(/Standard/gi, '').trim();
        meta.push(shortOS);
      }

      // Build device name with disk/memory info
      let deviceName = alert.DeviceName;
      if (type === 'disk') {
        const driveMatch2 = alert.Title?.match(/Disk Usage\(([A-Z]:)\)/i);
        if (driveMatch2 && alert.HardwareDisks) {
          const drive = driveMatch2[1];
          const diskData = alert.HardwareDisks.find((d: any) => d.Drive?.toUpperCase() === drive.toUpperCase());
          if (diskData) {
            const pct = Math.round((diskData.Used / diskData.Total) * 100);
            deviceName = `${alert.DeviceName} · Disco ${drive} ${pct}%`;
            meta.length = 0;
            meta.push(`${Math.round(diskData.Used)} GB / ${Math.round(diskData.Total)} GB`);
            meta.push(`${Math.round(diskData.Free)} GB libres`);
          }
        }
      } else if (type === 'memory') {
        const memMatch = (alert.AlertMessage || '').match(/Se están consumiendo ([\d.]+)\s*GB de ([\d.]+)\s*GB/i);
        if (memMatch) {
          const pct = Math.round((parseFloat(memMatch[1]) / parseFloat(memMatch[2])) * 100);
          deviceName = `${alert.DeviceName} · Memoria ${pct}%`;
          meta.length = 0;
          meta.push(`${memMatch[1]} GB / ${memMatch[2]} GB`);
        }
      }

      return {
        type,
        deviceName: deviceName.toUpperCase(),
        href: `https://app.atera.com/new/rmm/device/${alert.DeviceGuid}/agent`,
        meta: meta.length > 0 ? meta : ['Sin info'],
        duration,
        diskBar,
      };
    });

    // Sort: offline first, then memory, then disk
    processedAlerts.sort((a: any, b: any) => {
      const order = { offline: 0, memory: 1, disk: 2 };
      return order[a.type] - order[b.type];
    });

    const severity: 'critical' | 'orange' | 'warning' = hasOffline ? 'critical' : hasMemory ? 'orange' : 'warning';

    let badgeText = '';
    if (hasOffline) badgeText = `${offlineAlertCount} OFFLINE`;
    else if (hasMemory && hasDisk) badgeText = `${processedAlerts.length} ALERTAS`;
    else if (hasMemory) badgeText = `${memAlertCount} MEMORIA`;
    else badgeText = `${diskAlertCount} DISCOS`;

    let subtitle = '';
    if (hasOffline && hasDisk) subtitle = `${offlineAlertCount} servers offline · ${diskAlertCount} discos llenos`;
    else if (hasOffline) subtitle = 'Servidor no responde';
    else if (hasDisk) subtitle = `${diskAlertCount} discos llenos o cerca del límite`;
    else if (hasDisk && diskAlertCount > 1) subtitle = `${diskAlertCount} alertas de disco`;
    else subtitle = 'Alerta activa';

    const firstTime = alerts[0]?.incidents?.[0]?.created;
    const reportedTime = firstTime ? formatISOAgo(firstTime) : '?';

    return {
      customerName,
      initials: getInitials(customerName),
      severity,
      alerts: processedAlerts,
      badgeText,
      subtitle,
      reportedLabel: hasOffline ? 'Último contacto' : 'Más reciente',
      reportedTime,
    };
  });

  // Sort: critical > orange > warning
  const severityOrder = { critical: 0, orange: 1, warning: 2 };
  customers.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return { customers, offlineCount, memoryCount, diskCount };
}

/* =====================================================================
   ARUBA DATA PROCESSING
   ===================================================================== */

interface ArubaSiteGroup {
  initials: string;
  title: string;
  subtitle: string;
  severity: 'critical' | 'warning';
  badgeText: string;
  devices: Array<{
    name: string;
    model: string;
    ip: string;
    duration: string;
    href: string;
    type: 'switch' | 'ap';
  }>;
  reportedLabel: string;
  reportedTime: string;
}

function processArubaData(data: any): { sites: ArubaSiteGroup[]; criticalCount: number; warningCount: number } {
  if (!data?.data) return { sites: [], criticalCount: 0, warningCount: 0 };

  let criticalCount = 0;
  let warningCount = 0;

  const sites: ArubaSiteGroup[] = data.data
    .filter((site: any) => site.total_devices_problem > 0)
    .map((site: any) => {
      const allDown = site.total_devices_problem === site.total_devices;
      if (allDown) criticalCount++; else warningCount++;

      const portalUrl = `https://portal.instant-on.hpe.com/sites/${site.site_id}/overview`;
      const parts = (site.site_name || '').split(' - ');
      const titleDisplay = parts.length >= 2 ? `${parts[0]} · ${parts[1]}` : site.site_name;

      const problemDevices = (site.devices_problem || site.devices || [])
        .filter((d: any) => d.status !== 'connected')
        .map((device: any) => {
          const modelLower = (device.model || '').toLowerCase();
          const nameLower = (device.device_name || '').toLowerCase();
          const isAP = modelLower.includes('ap') || nameLower.includes('ap-') || nameLower.includes('ap ');
          return {
            name: device.device_name.toUpperCase(),
            model: device.model,
            ip: device.ip || device.ip_address || '',
            duration: device.last_communication_datetime ? formatArubaAgo(device.last_communication_datetime) : '?',
            href: portalUrl,
            type: isAP ? 'ap' as const : 'switch' as const,
          };
        });

      return {
        initials: getInitials(parts[0] || site.site_name),
        title: titleDisplay,
        subtitle: allDown ? 'Sitio completamente offline' : `${site.total_devices_problem} de ${site.total_devices} dispositivos con problemas`,
        severity: allDown ? 'critical' as const : 'warning' as const,
        badgeText: `${site.total_devices_problem}/${site.total_devices} DOWN`,
        devices: problemDevices,
        reportedLabel: allDown ? 'Primer evento' : 'Desde',
        reportedTime: problemDevices[0]?.duration || '?',
      };
    });

  // Critical first
  sites.sort((a: ArubaSiteGroup, b: ArubaSiteGroup) => {
    if (a.severity !== b.severity) return a.severity === 'critical' ? -1 : 1;
    return 0;
  });

  return { sites, criticalCount, warningCount };
}

/* =====================================================================
   DASHBOARD COMPONENT
   ===================================================================== */

function Dashboard() {
  const [location, setLocation] = useLocation();
  const tabFromPath = location === '/tab2' ? 'services' : 'infrastructure';
  const [activeTab, setActiveTab] = useState(tabFromPath);

  useEffect(() => {
    if (location === '/') setLocation('/tab1', { replace: true });
  }, [location, setLocation]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setLocation(tabId === 'services' ? '/tab2' : '/tab1');
  };

  /* Polling queries */
  const uptimeQuery = usePolling('/uptime', 3000);
  const ateraQuery = usePolling('/atera', 3000);
  const arubaQuery = usePolling('/aruba', 3000);
  const externalServicesQuery = usePolling('/rss', 3000);
  const backupAlertsQuery = usePolling('/gmail', 3000);

  /* Process real data */
  const uptimeResult = processUptimeData(uptimeQuery.data);
  const ateraResult = processAteraData(ateraQuery.data);
  const arubaResult = processArubaData(arubaQuery.data);

  /* Sound alert logic */
  const criticalCounts = {
    uptime: uptimeResult.criticalCount,
    atera: ateraResult.offlineCount,
    aruba: arubaResult.criticalCount,
  };
  const prevCriticalCountsRef = useRef({ uptime: 0, atera: 0, aruba: 0 });

  useEffect(() => {
    const { uptime, atera, aruba } = criticalCounts;
    const prev = prevCriticalCountsRef.current;
    if (uptime > prev.uptime || atera > prev.atera || aruba > prev.aruba) {
      const audio = new Audio(alertSound);
      audio.play().catch((e) => console.log('Audio play failed', e));
    }
    prevCriticalCountsRef.current = criticalCounts;
  }, [criticalCounts.uptime, criticalCounts.atera, criticalCounts.aruba]);

  return (
    <>
      {/* ============ TOPBAR ============ */}
      <div className="topbar flex justify-between items-center">
        <div className="brand">
          <img src={logoImg} alt="Quaga Monitor" style={{ height: '5rem' }} className="w-auto object-contain drop-shadow-[0_0_8px_rgba(134,180,255,0.3)]" />
        </div>
        <div className="topbar-right">
          <div className="tabs !mb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab${activeTab === tab.id ? ' active' : ''}`}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============ CONTENT ============ */}
      {activeTab === 'infrastructure' ? (
        <div className="columns">
          {/* UPTIME ROBOT */}
          <Column kind="uptime" title="UPTIME ROBOT" counts={[
            ...(uptimeResult.criticalCount > 0 ? [{ label: `${uptimeResult.criticalCount} críticos`, severity: 'critical' as const }] : []),
            ...(uptimeResult.warningCount > 0 ? [{ label: `${uptimeResult.warningCount} degradados`, severity: 'warning' as const }] : []),
          ]}>
            {uptimeResult.sites.slice(0, 5).map((site) => {
              const downIsps = site.isps.filter(i => i.status === 'Down');
              const upIsps = site.isps.filter(i => i.status !== 'Down');
              const allDown = site.isps.every(i => i.status === 'Down');
              const severity = allDown ? 'critical' as const : 'warning' as const;
              const badgeText = `${downIsps.length}/${site.isps.length} DOWN`;

              const subtitle = allDown
                ? (site.isps.length > 1 ? 'Corte total · todos los enlaces caídos' : 'Corte total · ISP único sin respaldo')
                : 'Conectividad degradada · failover activo';

              return (
                <UptimeCard
                  key={site.siteKey}
                  initials={site.initials}
                  title={`${site.clientName}${site.siteName ? ` · ${site.siteName}` : ''}`.toUpperCase()}
                  subtitle={subtitle}
                  severity={severity}
                  badgeText={badgeText}
                  downIsps={downIsps.map(isp => ({
                    name: isp.name,
                    tag: isp.tag,
                    tagClass: isp.tagClass,
                    href: `https://dashboard.uptimerobot.com/monitors/${isp.monitorId}`,
                    hostname: isp.hostname,
                    type: isp.type,
                    duration: formatDuration(isp.lastDown),
                  }))}
                  activeIsps={upIsps.length > 0 ? {
                    count: upIsps.length,
                    list: upIsps.map(i => i.name),
                  } : undefined}
                  reportedLabel={allDown ? 'Reportado' : 'Degradado'}
                  reportedTime={formatDuration(downIsps[0]?.lastDown || 'Unknown')}
                  clientPageUrl={site.isps[0]?.custom_url || '#'}
                />
              );
            })}
            
            {uptimeResult.sites.length > 5 && (
              <ShowMore count={uptimeResult.sites.length - 5} label="clientes más">
                {uptimeResult.sites.slice(5).map((site) => {
                  const downIsps = site.isps.filter(i => i.status === 'Down');
                  const upIsps = site.isps.filter(i => i.status !== 'Down');
                  const allDown = site.isps.every(i => i.status === 'Down');
                  const severity = allDown ? 'critical' as const : 'warning' as const;
                  const badgeText = `${downIsps.length}/${site.isps.length} DOWN`;
                  const subtitle = allDown ? (site.isps.length > 1 ? 'Corte total · todos los enlaces caídos' : 'Corte total · ISP único sin respaldo') : 'Conectividad degradada · failover activo';

                  return (
                    <UptimeCard
                      key={site.siteKey}
                      initials={site.initials}
                      title={`${site.clientName}${site.siteName ? ` · ${site.siteName}` : ''}`.toUpperCase()}
                      subtitle={subtitle}
                      severity={severity}
                      badgeText={badgeText}
                      downIsps={downIsps.map(isp => ({
                        name: isp.name,
                        tag: isp.tag,
                        tagClass: isp.tagClass,
                        href: `https://dashboard.uptimerobot.com/monitors/${isp.monitorId}`,
                        hostname: isp.hostname,
                        type: isp.type,
                        duration: formatDuration(isp.lastDown),
                      }))}
                      activeIsps={upIsps.length > 0 ? {
                        count: upIsps.length,
                        list: upIsps.map(i => i.name),
                      } : undefined}
                      reportedLabel={allDown ? 'Reportado' : 'Degradado'}
                      reportedTime={formatDuration(downIsps[0]?.lastDown || 'Unknown')}
                      clientPageUrl={site.isps[0]?.custom_url || '#'}
                    />
                  );
                })}
              </ShowMore>
            )}
          </Column>

          {/* ATERA */}
          <Column kind="atera" title="ATERA" counts={[
            ...(ateraResult.offlineCount > 0 ? [{ label: `${ateraResult.offlineCount} apagados`, severity: 'critical' as const }] : []),
            ...(ateraResult.memoryCount > 0 ? [{ label: `${ateraResult.memoryCount} memoria`, severity: 'orange' as const }] : []),
            ...(ateraResult.diskCount > 0 ? [{ label: `${ateraResult.diskCount} disco`, severity: 'warning' as const }] : []),
          ]}>
            {ateraResult.customers.slice(0, 5).map((customer) => (
              <AteraCard
                key={customer.customerName}
                initials={customer.initials}
                title={customer.customerName.toUpperCase()}
                subtitle={customer.subtitle}
                severity={customer.severity}
                badgeText={customer.badgeText}
                alerts={customer.alerts}
                reportedLabel={customer.reportedLabel}
                reportedTime={customer.reportedTime}
              />
            ))}
            
            {ateraResult.customers.length > 5 && (
              <ShowMore count={ateraResult.customers.length - 5} label="clientes más">
                {ateraResult.customers.slice(5).map((customer) => (
                  <AteraCard
                    key={customer.customerName}
                    initials={customer.initials}
                    title={customer.customerName.toUpperCase()}
                    subtitle={customer.subtitle}
                    severity={customer.severity}
                    badgeText={customer.badgeText}
                    alerts={customer.alerts}
                    reportedLabel={customer.reportedLabel}
                    reportedTime={customer.reportedTime}
                  />
                ))}
              </ShowMore>
            )}
          </Column>

          {/* ARUBA */}
          <Column kind="aruba" title="ARUBA" counts={[
            ...(arubaResult.criticalCount > 0 ? [{ label: `${arubaResult.criticalCount} sitios`, severity: 'critical' as const }] : []),
            ...(arubaResult.warningCount > 0 ? [{ label: `${arubaResult.warningCount} problemas`, severity: 'warning' as const }] : []),
          ]}>
            {arubaResult.sites.slice(0, 5).map((site, idx) => (
              <ArubaCard
                key={`aruba-${idx}`}
                initials={site.initials}
                title={site.title.toUpperCase()}
                subtitle={site.subtitle}
                severity={site.severity}
                badgeText={site.badgeText}
                devices={site.devices}
                maxVisible={3}
                reportedLabel={site.reportedLabel}
                reportedTime={site.reportedTime}
              />
            ))}
            
            {arubaResult.sites.length > 5 && (
              <ShowMore count={arubaResult.sites.length - 5} label="sitios más">
                {arubaResult.sites.slice(5).map((site, idx) => (
                  <ArubaCard
                    key={`aruba-${idx}`}
                    initials={site.initials}
                    title={site.title.toUpperCase()}
                    subtitle={site.subtitle}
                    severity={site.severity}
                    badgeText={site.badgeText}
                    devices={site.devices}
                    maxVisible={3}
                    reportedLabel={site.reportedLabel}
                    reportedTime={site.reportedTime}
                  />
                ))}
              </ShowMore>
            )}
          </Column>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-7 mt-6">
          <ExternalServicesColumn {...externalServicesQuery} />
          <BackupAlertsColumn {...backupAlertsQuery} />
        </div>
      )}
    </>
  );
}

export default Dashboard;
