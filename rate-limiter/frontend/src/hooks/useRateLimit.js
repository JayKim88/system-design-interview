import { useState, useCallback, useRef } from "react";

export const useRateLimit = () => {
  const [requestQueue, setRequestQueue] = useState([]);
  const [stats, setStats] = useState({
    successful: 0,
    rateLimited: 0,
    remaining: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const requestId = useRef(0);

  const makeRequest = useCallback(async (algorithm) => {
    const id = ++requestId.current;
    const startTime = Date.now();

    setIsLoading(true);

    try {
      const response = await fetch(`/api/${algorithm}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const endTime = Date.now();
      const success = response.ok;

      const newRequest = {
        id,
        timestamp: startTime,
        status: success ? "success" : "rate-limited",
        responseTime: endTime - startTime,
        algorithm,
      };

      setRequestQueue((prev) => [...prev, newRequest]);

      setStats((prev) => ({
        ...prev,
        successful: success ? prev.successful + 1 : prev.successful,
        rateLimited: success ? prev.rateLimited : prev.rateLimited + 1,
        remaining: parseInt(
          response.headers.get("X-RateLimit-Remaining") || "0"
        ),
      }));
    } catch (error) {
      console.error("Request failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    makeRequest,
    requestQueue,
    stats,
    isLoading,
  };
};
