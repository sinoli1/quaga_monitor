import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export function usePolling<T>(url: string, interval: number = 30000) {
  const [countdown, setCountdown] = useState(interval / 1000);

  const query = useQuery<T>({
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
