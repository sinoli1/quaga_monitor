import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import {
  UptimeMonitor,
  AteraAlert,
  ArubaSite,
  ExternalServices,
  BackupAlerts,
  TunnelsSummary
} from "@/types";

type ApiResponseType<T extends string> =
  T extends "/uptime" ? UptimeMonitor[] :
  T extends "/atera" ? AteraAlert[] :
  T extends "/aruba" ? ArubaSite[] :
  T extends "/rss" ? ExternalServices :
  T extends "/gmail" ? BackupAlerts :
  T extends "/tunnels" ? TunnelsSummary :
  unknown;

export function usePolling<T extends string>(url: T, interval: number = 30000) {
  const [countdown, setCountdown] = useState(interval / 1000);

  const query = useQuery<ApiResponseType<T>>({
    queryKey: [url],
    refetchInterval: interval,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? interval / 1000 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [interval]);

  // Reset countdown when refetching starts
  useEffect(() => {
    if (query.isFetching) {
      setCountdown(interval / 1000);
    }
  }, [query.isFetching, interval]);

  return {
    ...query,
    countdown,
    secondsUntilRefetch: countdown
  };
}
