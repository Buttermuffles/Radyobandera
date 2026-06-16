import { useEffect, useState } from "react";
import { getLiveStream } from "../lib/api";
import type { LiveStreamResponse } from "../types/news";

export function useLiveStream() {
  const [stream, setStream] = useState<LiveStreamResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    getLiveStream().then((data) => {
      if (mounted) {
        setStream(data);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  return { stream, loading };
}
