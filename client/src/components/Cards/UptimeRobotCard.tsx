import {
    ExternalLinkIcon,
    Cable,
    Zap,
    ZapOff,
    Clock,
    Globe,
    Monitor
} from "lucide-react";
import DashboardCard from "@/components/Dashboard/Card";
import { CSSProperties } from "react";
import { useState } from "react";

interface UptimeRobotCardProps {
    clientName: string;
    monitorName: string;
    status: string;
    lastDown: string;
    url: string;
    statusUrl: string;
    isCritical: boolean;
    logo?: string | null;
}

// --- Clases de Color Simplificadas para Priorizar Alertas ---
const NEUTRAL_BADGE = "bg-gray-700/50 text-gray-300 border border-gray-600";
const WARNING_BADGE_CLASS = "bg-yellow-800/20 text-yellow-400 border border-yellow-800"; // Advertencia: Amarillo
const CRITICAL_BADGE_CLASS = "bg-red-800/20 text-red-400 border border-red-800"; // Crítico: Rojo
// -----------------------------------------------------------


const parseUptimeString = (time: string): number => {
    if (time === "Unknown") return 999;
    const daysMatch = time.match(/(\d+)\s+days?/);
    const timeMatch = time.match(/(\d+):(\d+):(\d+)/);

    const days = daysMatch ? parseInt(daysMatch[1]) : 0;
    const hours = timeMatch ? parseInt(timeMatch[1]) : 0;
    const minutes = timeMatch ? parseInt(timeMatch[2]) : 0;

    return days + hours / 24 + minutes / 1440;
};

const getBadgeClass = (time: string) => {
    try {
        const totalDays = parseUptimeString(time);
        // Menos de 1 día (reciente) -> Azul (Color menos urgente)
        if (totalDays < 1) return "bg-blue-800/20 text-blue-400";
        // Entre 1 y 2 días -> Amarillo (Advertencia de tiempo)
        if (totalDays < 2) return "bg-yellow-800/20 text-yellow-400";
        // Más de 2 días -> Rojo (Urgencia de tiempo)
        return "bg-red-800/20 text-red-400";
    } catch {
        return "bg-gray-500/20 text-gray-400";
    }
};

const formatLastDown = (time: string) => {
    if (time === "Unknown") return "Desconocido";

    const daysMatch = time.match(/(\d+)\s+days?/);
    const timeMatch = time.match(/(\d+):(\d+):(\d+)/);

    const d = daysMatch ? `${daysMatch[1]}d` : "";
    const h = timeMatch ? `${parseInt(timeMatch[1])}h` : "";
    const m = timeMatch ? `${parseInt(timeMatch[2])}m` : "";

    return [d, h, m].filter(Boolean).join(" ");
};

const formatMonitorName = (monitorName: string) => {
    const parts = monitorName.split(" - ");
    if (parts.length > 1) {
        return parts.slice(1).join(" - ");
    }
    return monitorName;
};

const UptimeRobotCard = ({
    clientName,
    monitorName,
    status,
    lastDown,
    url,
    statusUrl,
    isCritical,
    logo,
}: UptimeRobotCardProps) => {
    const getInitials = (name?: string): string => {
        if (!name) return "?";
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    // 🚨 FUNCIÓN MODIFICADA: Genera degradado basado en isCritical 🚨
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

    // 🚨 FUNCIÓN MODIFICADA: Genera borde basado en isCritical 🚨
    const getInitialsBorderStyle = (isCritical: boolean): CSSProperties => {
        if (isCritical) {
            // Borde CRÍTICO
            return { borderColor: `#f87171` };
        } else {
            // Borde ADVERTENCIA
            return { borderColor: `#fbbf24` };
        }
    };

    // 🚨 FUNCIÓN MODIFICADA: Usa la nueva lógica de color 🚨
    const renderClientLogo = () => {
        // Si hay un logo, usamos un borde neutro para no distorsionar la imagen.
        if (logo) {
            const borderStyle = getInitialsBorderStyle(isCritical); // Usamos el borde de alerta.
            return (
                <img
                    src={logo}
                    alt={clientName}
                    className="w-10 h-10 shrink-0 rounded-full object-contain border-2 bg-white p-0.5" // Añadimos bg-white para logos
                    style={borderStyle}
                />
            );
        }

        // Si no hay logo, mostramos las iniciales con el color de la alerta.
        const initials = getInitials(clientName);
        const bgStyle = getInitialsBackgroundStyle(isCritical);
        const borderStyle = getInitialsBorderStyle(isCritical);

        return (
            <div
                className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-bold text-white border-2"
                style={{ ...bgStyle, ...borderStyle }}
            >
                {initials}
            </div>
        );
    };

    const mensajesCriticos = [
        {
            subtitle: "Corte total detectado",
            recommendation: "Sin acceso remoto. Consultar al cliente si observa luz LOS en la ONT y escalar al proveedor principal."
        },
        {
            subtitle: "Sin conectividad en ningún enlace",
            recommendation: "Revisar alimentación y estado óptico. Confirmar con el cliente si la ONT indica falla (LOS)."
        },
        {
            subtitle: "Caída total de servicios",
            recommendation: "No hay acceso por DDNS. Confirmar estado de ONT y reportar al ISP correspondiente."
        }
    ];

    const mensajesParciales = [
        {
            subtitle: "Caída parcial de enlaces",
            recommendation: "Verificar interfaz del ISP afectado en el MikroTik y confirmar si mantiene acceso por puerto 10921."
        },
        {
            subtitle: "Un enlace presenta fallas",
            recommendation: "Revisar enlace físico y estado PPPoE. Si el router sigue accesible, abrir reclamo con proveedor secundario."
        },
        {
            subtitle: "Conectividad degradada",
            recommendation: "El MikroTik responde por backup. Analizar logs y validar si el ISP principal perdió sesión."
        }
    ];

    const getStatusInfo = (isCritical: boolean) => {
        const lista = isCritical ? mensajesCriticos : mensajesParciales;
        return lista[Math.floor(Math.random() * lista.length)];
    };


    const monitorId = statusUrl.split("/").pop();
    const monitorDescription = formatMonitorName(monitorName);
    const maxLength = 50;
    const truncatedUrl = url.length > maxLength ? url.slice(0, maxLength) + "..." : url;
    // Se mantiene el uso de useState para un solo cálculo inicial
    const [statusInfo] = useState(() => getStatusInfo(isCritical));


    return (
        <DashboardCard variant={isCritical ? "critical" : "warning"} className="min-h-[250px]">
            {/* HEADER */}

            <header className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    {renderClientLogo()}
                    <div className="flex flex-col">
                        <h3 className="text-base font-bold text-white leading-tight">
                            {clientName.toUpperCase()}
                        </h3>
                        <p
                            className={`text-xs font-medium ${
                                // Subtítulo con el color de la alerta
                                isCritical ? "text-red-400" : "text-yellow-400"
                                }`}
                        >
                            {statusInfo.subtitle}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center justify-end">
                    <div
                        // Badge principal: Foco en Crítico (Rojo) o Advertencia (Amarillo)
                        className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1.5 font-semibold ${isCritical
                            ? `${CRITICAL_BADGE_CLASS} animate-glow-pulse`
                            : WARNING_BADGE_CLASS
                            }`}
                    >
                        {isCritical ? (
                            <ZapOff className="w-3.5 h-3.5" />
                        ) : (
                            <Zap className="w-3.5 h-3.5" />
                        )}
                        <span>{isCritical ? "CRÍTICO" : "Revisar"}</span>
                    </div>
                </div>
            </header>


            {/* CONTENIDO - DETALLES */}
            <div className="mb-4">
                <div className="flex items-start gap-3 mb-3">
                    {/* Ícono Cable: Fondo y color usan la clase de alerta */}
                    <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-800/30' : 'bg-yellow-800/30'}`}>
                        <Cable className={`w-4 h-4 ${isCritical ? 'text-red-400' : 'text-yellow-400'}`} />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-white font-semibold text-sm leading-tight mb-1">
                            {monitorDescription}
                        </h4>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            {statusInfo.recommendation}
                        </p>
                    </div>
                </div>
            </div>

            {/* INFO DEL MONITOR (URL y Status Badge) - NEUTRALIZADOS */}
            <div className="flex items-center gap-2 mb-3 overflow-hidden flex-nowrap">
                {url && (
                    // URL: Gris neutro.
                    <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs shrink-0 ${NEUTRAL_BADGE}`}>
                        <Globe className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="text-gray-300 font-mono text-xs truncate block max-w-[140px] sm:max-w-[220px] md:max-w-[280px]">
                            {truncatedUrl}
                        </span>
                    </div>
                )}
                {status && (
                    // Dashboard: Gris neutro.
                    <a
                        href={`https://dashboard.uptimerobot.com/monitors/${monitorId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs hover:bg-gray-600 transition-colors cursor-pointer shrink-0 ${NEUTRAL_BADGE}`}
                    >
                        <Monitor className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-300 capitalize">Dashboard</span>
                    </a>
                )}
            </div>


            {/* FOOTER */}
            <footer className="pt-3 border-t border-gray-700/50 flex justify-between items-center flex-wrap gap-4">
                <div className="inline-flex items-center gap-2 text-xs bg-gray-700/30 rounded-full py-0.5 pr-2 pl-1 text-gray-300">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Reportado:</span>
                    {/* Antigüedad: Se mantiene la escala de azul/amarillo/rojo */}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getBadgeClass(lastDown)}`}>
                        {formatLastDown(lastDown)}
                    </span>
                </div>

                {/* Botón de Página de Estado: Gris neutro */}
                <a
                    href={statusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-700/50 hover:bg-gray-600 text-gray-300 font-medium rounded-lg transition-colors text-xs"
                >
                    Pagina de estado
                    <ExternalLinkIcon className="h-3 w-3" />
                </a>
            </footer>
        </DashboardCard>
    );
};

export default UptimeRobotCard;