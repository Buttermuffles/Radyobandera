import { useEffect, useMemo, useRef, useState } from "react";
import Hls from "hls.js";
import { Play } from "lucide-react";

interface LivePlayerProps {
  videoUrl: string;
  isLive: boolean;
}

export function LivePlayer({ videoUrl, isLive }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoUrl;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(videoUrl);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
  }, [videoUrl]);

  const badgeLabel = useMemo(() => (isLive ? "LIVE" : "OFF AIR"), [isLive]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-slate-950">
      <video
        ref={videoRef}
        controls={started}
        muted
        className="aspect-video w-full"
        aria-label="Live stream player"
      />
      {!started ? (
        <button
          type="button"
          className="absolute inset-0 flex items-center justify-center bg-black/35"
          onClick={() => {
            void videoRef.current?.play();
            setStarted(true);
          }}
          aria-label="Play live stream"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-5 py-2 font-ui text-sm font-bold text-slate-900">
            <Play className="h-4 w-4 fill-current" />
            Start Stream
          </span>
        </button>
      ) : null}

      <p className="absolute left-3 top-3 rounded-full bg-black/50 px-2 py-1 text-xs font-bold tracking-wide text-white">
        <span className={isLive ? "text-red-400" : "text-slate-400"}>●</span> {badgeLabel}
      </p>
    </div>
  );
}
