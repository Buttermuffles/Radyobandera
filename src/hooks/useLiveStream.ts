import { useEffect, useState } from "react";
import { getLiveStream } from "../lib/api";
import type { LiveStreamResponse } from "../types/news";

export function useLiveStream() {
  const [stream, setStream] = useState<LiveStreamResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let interval: ReturnType<typeof setInterval>;

    async function fetchStream() {
      const data = await getLiveStream();
      if (mounted) {
        setStream(data);
        setLoading(false);
      }
    }

    fetchStream();
    interval = setInterval(fetchStream, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { stream, loading };
}
