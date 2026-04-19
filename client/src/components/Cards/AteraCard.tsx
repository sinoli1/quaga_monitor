import {
    ServerCrash,
    Info,
    ExternalLink,
    HardDrive,
    MemoryStick,
    ThermometerSun,
    Clock,
    Globe,
    Monitor,
    Power
} from 'lucide-react';
import {
    parseISO,
    differenceInDays,
    differenceInHours,
    differenceInMinutes
} from 'date-fns';
import DashboardCard from "@/components/Dashboard/Card";
import { useMemo, CSSProperties } from "react";

interface HardwareDisk {
    Drive: string;
    Free: number;
    Total: number;
    Used: number;
}

interface AteraCardProps {
    title: string;
    description: string;
    startTime: string;
    resolved: string | null;
    deviceGuid: string;
    ipAddress?: string;
    os?: string;
    alertTitle?: string;
    hardwareDisks?: HardwareDisk[];
    logo?: string | null;
    customerName?: string;
}

// --- Clases de Tailwind para el Esquema de Color ---
const NEUTRAL_BADGE = "bg-gray-700/50 text-gray-300"; // General para IP, OS, etc.
const WARNING_BADGE_CLASS = "bg-yellow-800/20 text-yellow-400 border border-yellow-800"; // Alerta: Amarillo/Naranja
const CRITICAL_BADGE_CLASS = "bg-red-800/20 text-red-400 border border-red-800"; // Crítico: Rojo

// --- Función para obtener el color de uso (ej. RAM/Disco)
const getUsageColorClass = (usedPercentage: number): string => {
    if (usedPercentage < 70) return "text-green-400"; // Bajo/Normal
    if (usedPercentage < 90) return "text-yellow-400"; // Alto (Advertencia)
    return "text-red-400"; // Muy Alto (Crítico)
};
// -----------------------------------------------------------


const AteraCard = ({
    title,
    description,
    startTime,
    resolved,
    deviceGuid,
    ipAddress,
    os,
    alertTitle,
    hardwareDisks,
    logo,
    customerName
}: AteraCardProps) => {

    // Centralizamos la lógica de estado crítico/offline
    const isMachineOffline = useMemo(() => {
        if (!alertTitle) return false;
        // La máquina está apagada o no reporta estado (CRÍTICO/ROJO)
        return alertTitle.toLowerCase().includes("machine status unknown");
    }, [alertTitle]);

    // Usamos este booleano para el DashboardCard y las iniciales
    const isCritical = isMachineOffline;


    const getCompactTimeAgo = (time: string) => {
        try {
            const now = new Date();
            const parsed = parseISO(time);
            const mins = differenceInMinutes(now, parsed);
            const hours = differenceInHours(now, parsed);
            const days = differenceInDays(now, parsed);

            if (mins < 60) return `${mins}m atrás`;
            if (hours < 24) return `${hours}h atrás`;
            if (days < 7) return `${days}d atrás`;
            return `${Math.floor(days / 7)}w atrás`;
        } catch {
            return time;
        }
    };

    const getBadgeClass = (time: string) => {
        try {
            const days = differenceInDays(new Date(), parseISO(time));
            const hours = differenceInHours(new Date(), parseISO(time));

            if (hours < 24) return "bg-blue-800/20 text-blue-400";
            if (days <= 2) return "bg-yellow-800/20 text-yellow-400";
            if (days <= 6) return "bg-orange-800/20 text-orange-400";
            return "bg-red-800/20 text-red-400";
        } catch {
            return "bg-gray-500/20 text-gray-400";
        }
    };

    const formatDescription = (desc: string) => {
        // Lógica de formato (RAM, Disco, Offline) se mantiene igual
        const memoryMatch = desc.match(/Se están consumiendo (.+?) de (.+?) disponibles\. Los procesos principales son:/i);

        if (memoryMatch) {
            const [, used, total] = memoryMatch;
            const processRegex = /-\s*([^:]+):\s*([\d.]+\s*GB)/gi;
            const processes = Array.from(desc.matchAll(processRegex)).map(([, name, mem]) => ({
                name: name.trim(),
                memory: mem.trim()
            }));

            const usedGB = parseFloat(used.replace(/[^\d.]/g, ''));
            const totalGB = parseFloat(total.replace(/[^\d.]/g, ''));
            const percentage = (usedGB / totalGB) * 100;
            const colorClass = getUsageColorClass(percentage);

            return (
                <div className="space-y-2">
                    <p className="text-white text-sm leading-snug">
                        Se están consumiendo <span className={`font-semibold ${colorClass}`}>{used}</span> de <span className="font-semibold">{total}</span> disponibles.
                    </p>
                    {processes.length > 0 && (
                        <>
                            <p className="text-gray-400 text-xs">Los procesos principales son:</p>
                            <ul className="pl-4 list-disc space-y-0.5 text-xs text-gray-400">
                                {processes.map((proc, i) => (
                                    <li key={i}>
                                        <span className="text-gray-300">{proc.name}</span>
                                        {": "}
                                        <span className="font-mono text-gray-400">{proc.memory}</span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>
            );
        }

        const diskMatch = desc.match(/El disco ([A-Z]:) tiene ([\d.]+\s*GB) ocupados de ([\d.]+\s*GB) totales \(([\d.]+\s*GB) libres\)\./i);

        if (diskMatch) {
            const [fullMatch, drive, used, total, free] = diskMatch;
            const recommendation = desc.substring(fullMatch.length).trim();

            const usedGB = parseFloat(used.replace(/[^\d.]/g, ''));
            const totalGB = parseFloat(total.replace(/[^\d.]/g, ''));
            const percentageUsed = (usedGB / totalGB) * 100;
            const colorClass = getUsageColorClass(percentageUsed);

            return (
                <div className="space-y-2">
                    <p className="text-white text-sm leading-snug">
                        El disco <span className="font-semibold text-gray-300">{drive}</span> tiene{" "}
                        <span className={`font-semibold ${colorClass}`}>{used}</span> ocupados de{" "}
                        <span className="font-semibold">{total}</span> totales{" "}
                        (<span className="font-mono text-gray-300">{free}</span> libres).
                    </p>
                    {recommendation && (
                        <p className="text-gray-400 text-xs leading-relaxed">
                            {recommendation}
                        </p>
                    )}
                </div>
            );
        }

        if (desc.match(/Revisemos el estado del agente/i) || desc.match(/intervalo de comunicación/i)) {
            const timeMatches = desc.match(/(\d+)\s*minutos/gi);

            return (
                <div className="space-y-2">
                    <p className="text-white text-sm leading-snug">
                        El agente no responde. {timeMatches && timeMatches.length >= 1 && (
                            <>
                                Intervalo esperado: <span className="font-mono text-gray-400">{timeMatches[0]}</span>
                                {timeMatches[1] && <>, retraso actual: <span className="font-mono text-red-400">{timeMatches[1]}</span></>}.
                            </>
                        )}
                    </p>
                    <p className="text-gray-400 text-xs">
                        Verificar estado del servidor, configuración de red y conectividad.
                    </p>
                </div>
            );
        }

        return (
            <p className="text-gray-400 whitespace-pre-line text-sm leading-normal">
                {desc}
            </p>
        );
    };

    const getDiskInfo = (): { drive: string; percentage: number; free: number; total: number } | null => {
        if (!alertTitle || !hardwareDisks) return null;

        const driveMatch = alertTitle.match(/Disk Usage\(([A-Z]:)\)/i);
        if (!driveMatch) return null;

        const driveLetter = driveMatch[1].toUpperCase();
        const diskData = hardwareDisks.find(d => d.Drive.toUpperCase() === driveLetter);

        if (!diskData) return null;

        const percentage = (diskData.Used / diskData.Total) * 100;

        return {
            drive: driveLetter,
            percentage,
            free: diskData.Free,
            total: diskData.Total
        };
    };

    const extractMemoryPercentage = (text: string): number | null => {
        try {
            const match = text.match(/Se están consumiendo ([\d.]+)\s*GB de ([\d.]+)\s*GB/i);
            if (match) {
                const used = parseFloat(match[1]);
                const total = parseFloat(match[2]);
                return (used / total) * 100;
            }
            return null;
        } catch {
            return null;
        }
    };

    const extractTemperature = (text: string): number | null => {
        try {
            const match = text.match(/Temperatura:\s*(\d+)\s*°[CF]/i);
            return match ? parseFloat(match[1]) : null;
        } catch {
            return null;
        }
    };

    const getCustomerInitials = (name?: string): string => {
        if (!name) return "?";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // 🚨 MODIFICADO: Degradado basado en isCritical (Rojo si offline, Amarillo si advertencia)
    const getInitialsBackgroundStyle = (isCritical: boolean): CSSProperties => {
        if (isCritical) {
            // Degradado CRÍTICO (Rojo/Borgoña)
            return {
                background: `linear-gradient(135deg, #ef4444, #b91c1c)`,
            };
        } else {
            // Degradado ADVERTENCIA (Amarillo/Naranja)
            return {
                background: `linear-gradient(135deg, #f59e0b, #d97706)`,
            };
        }
    };

    // 🚨 MODIFICADO: Borde basado en isCritical (Rojo si offline, Amarillo si advertencia)
    const getInitialsBorderStyle = (isCritical: boolean): CSSProperties => {
        if (isCritical) {
            // Borde CRÍTICO
            return { borderColor: `#f87171` };
        } else {
            // Borde ADVERTENCIA
            return { borderColor: `#fbbf24` };
        }
    };

    const shortenOS = (osString: string): string => {
        if (!osString) return osString;
        return osString
            .replace(/Professional/gi, 'Pro')
            .replace(/Standard/gi, '')
            .replace(/Enterprise/gi, 'Ent')
            .replace(/Windows/gi, 'Win')
            .replace(/Server/gi, 'Server')
            .replace(/Service Pack/gi, 'SP')
            .trim();
    };

    const { AlertIcon, iconColor } = useMemo(() => {
        // Lógica de ícono
        if (!alertTitle) {
            return { AlertIcon: Info, iconColor: 'text-gray-400' };
        }

        const titleLower = alertTitle.toLowerCase();
        let icon = Info;
        let color = 'text-gray-400';

        if (titleLower.includes("disk usage")) {
            icon = HardDrive;
            color = 'text-yellow-500';
        } else if (titleLower.includes("memory usage")) {
            icon = MemoryStick;
            color = 'text-yellow-400';
        } else if (titleLower.includes("temperature")) {
            icon = ThermometerSun;
            // evitar rojo para no marcar crítico si no está apagado
            color = 'text-yellow-400';
        } else if (titleLower.includes("machine status unknown")) {
            icon = ServerCrash;
            color = 'text-red-500';
        }

        return { AlertIcon: icon, iconColor: color };
    }, [alertTitle]);

    const [deviceTitle, deviceSubtitle] = title.includes('|')
        ? title.split('|').map(s => s.trim())
        : [title.trim(), "Sin ubicación"];

    const isDiskAlert = alertTitle?.toLowerCase().includes("disk usage");
    const isMemoryAlert = alertTitle?.toLowerCase().includes("memory usage");
    const isTemperatureAlert = alertTitle?.toLowerCase().includes("temperature");

    const diskInfo = isDiskAlert ? getDiskInfo() : null;
    const memoryPercentage = isMemoryAlert ? extractMemoryPercentage(description) : null;
    const temperature = isTemperatureAlert ? extractTemperature(description) : null;

    const renderAlertBadge = () => {
        const baseClass = "text-xs px-2 py-0.5 rounded-full flex items-center gap-1.5 font-semibold transition-all duration-300";

        // 1. Máquina apagada/desconectada: CRÍTICO
        if (isMachineOffline) {
            return (
                <div className={`${baseClass} ${CRITICAL_BADGE_CLASS} animate-glow-pulse`}>
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <Power className="w-3.5 h-3.5" />
                    <span>CRÍTICO</span>
                </div>
            );
        }

        // 2. Temperatura: Advertencia
        if (temperature !== null) {
            return (
                <div className={`${baseClass} ${WARNING_BADGE_CLASS}`}>
                    <ThermometerSun className="w-3.5 h-3.5" />
                    <span className="font-mono">{temperature}°C</span>
                </div>
            );
        }

        // 3. Disco: Advertencia
        if (diskInfo) {
            const freePercentage = ((diskInfo.free / diskInfo.total) * 100);
            return (
                <div className={`${baseClass} ${WARNING_BADGE_CLASS}`}>
                    <HardDrive className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Disco</span>
                    <span className="font-mono">
                        <span className="hidden sm:inline">{diskInfo.drive} </span>
                        {freePercentage.toFixed(0)}% libre
                    </span>
                </div>
            );
        }

        // 4. RAM: Advertencia
        if (memoryPercentage !== null) {
            const freePercentage = (100 - memoryPercentage);
            return (
                <div className={`${baseClass} ${WARNING_BADGE_CLASS}`}>
                    <MemoryStick className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">RAM</span>
                    <span className="font-mono">{freePercentage.toFixed(0)}% libre</span>
                </div>
            );
        }

        // 5. Por defecto: Advertencia
        return (
            <div className={`${baseClass} ${WARNING_BADGE_CLASS}`}>
                <span className="w-2 h-2 rounded-full bg-yellow-400" />
                Advertencia
            </div>
        );
    };

    const renderCustomerLogo = () => {
        const borderStyle = getInitialsBorderStyle(isCritical);

        if (logo) {
            // Logo con borde de alerta
            // Logo con borde de alerta
            return (
                <img
                    src={logo}
                    alt={customerName}
                    className="w-10 h-10 shrink-0 rounded-full object-contain border-2 bg-white p-1"
                    style={borderStyle} // Usamos el color de alerta para el borde
                />
            );
        }

        // Iniciales con degradado y borde de alerta
        const initials = getCustomerInitials(customerName);
        const bgStyle = getInitialsBackgroundStyle(isCritical);

        return (
            <div
                className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white border-2"
                style={{ ...bgStyle, ...borderStyle }}
            >
                {initials}
            </div>
        );
    };

    return (
        // DashboardCard usa "critical" (rojo sutil) o "warning" (amarillo sutil)
        <DashboardCard variant={isCritical ? "critical" : "warning"} className="min-h-[250px]">
            <header className="flex justify-between items-start mb-3 gap-3 flex-wrap">
                {/* Logo + Nombre + Subtítulo */}
                <div className="flex items-start gap-2 min-w-0">
                    {renderCustomerLogo()}
                    <div className="flex flex-col min-w-0">
                        <h3 className="text-base font-bold text-white leading-tight truncate">
                            {deviceTitle}
                        </h3>
                        <span className="text-gray-400 font-medium text-sm truncate max-w-full">
                            {deviceSubtitle}
                        </span>
                    </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 items-center justify-end shrink-0">
                    {renderAlertBadge()}
                    {resolved && (
                        // Resuelto: Verde sutil
                        <div className="text-xs px-2 py-0.5 rounded-full font-semibold text-green-400 bg-green-800/20 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-400" />
                            Resuelto
                        </div>
                    )}
                </div>
            </header>


            <div className="text-sm mb-4">
                {formatDescription(description)}
            </div>

            {/* INFO DEL DISPOSITIVO (IP y SO) - NEUTRALIZADOS */}
            <div className="flex flex-wrap gap-2 mb-3">
                {ipAddress && (
                    // IP: Color neutro/gris
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-700/50 border border-gray-600 rounded-full text-xs">
                        <Globe className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-300 font-mono">{ipAddress}</span>
                    </div>
                )}
                {os && (
                    // OS: Color neutro/gris
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-700/50 border border-gray-600 rounded-full text-xs">
                        <Monitor className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-300 hidden sm:inline">{shortenOS(os)}</span>
                        <span className="text-gray-300 sm:hidden" title={os}>
                            {shortenOS(os).split(' ').slice(0, 2).join(' ')}
                        </span>
                    </div>
                )}
            </div>

            <footer className="pt-3 border-t border-gray-700/50 flex justify-between items-center flex-wrap gap-4">
                {/* Antigüedad de la Alerta: Se mantiene la escala de colores para indicar urgencia por tiempo */}
                <div className="inline-flex items-center gap-2 text-xs bg-gray-700/30 rounded-full py-0.5 pr-2 pl-1 text-gray-300">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Reportado:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getBadgeClass(startTime)}`}>
                        {getCompactTimeAgo(startTime)}
                    </span>
                </div>

                {/* Botón Atera: Se mantiene neutro */}
                <a
                    href={`https://app.atera.com/new/rmm/device/${deviceGuid}/agent`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-700/50 hover:bg-gray-600 hover:text-gray-100 text-gray-300 font-medium rounded-lg transition-colors text-xs"
                >
                    Ver en Atera
                    <ExternalLink className="h-3 w-3" />
                </a>
            </footer>
        </DashboardCard>
    );
};

export default AteraCard;