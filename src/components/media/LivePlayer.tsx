import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Radio } from "lucide-react";

interface LivePlayerProps {
  videoUrl: string;
  isLive: boolean;
  audioUrl?: string;
}

export function LivePlayer({ videoUrl, isLive, audioUrl }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setStarted(false); // Reset when URL changes
    const video = videoRef.current;
    if (!video || !videoUrl) return;

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

  return (
    <div className="space-y-3">
      {/* Video player */}
      <div className="relative overflow-hidden rounded-xl bg-slate-950">
        <video
          ref={videoRef}
          controls={started}
          muted
          className="aspect-video w-full"
          aria-label="Live stream player"
        />

        {/* Live badge */}
        <p className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-bold tracking-wide text-white backdrop-blur-sm">
          <span className={`h-1.5 w-1.5 rounded-full ${isLive ? "animate-pulse bg-red-500" : "bg-slate-500"}`} />
          {isLive ? "LIVE" : "OFF AIR"}
        </p>

        {/* Play overlay */}
        {!started && (
          <button
            type="button"
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/50 backdrop-blur-[2px]"
            onClick={() => {
              if (!videoUrl) return;
              void videoRef.current?.play();
              setStarted(true);
            }}
            aria-label="Play live stream"
          >
            {videoUrl ? (
              <>
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-red shadow-lg shadow-red-900/50 transition hover:scale-105">
                  <Play className="h-6 w-6 fill-white text-white" />
                </span>
                <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-white">
                  {isLive ? "Watch Live" : "Play Stream"}
                </span>
              </>
            ) : (
              <div className="text-center">
                <p className="text-sm font-bold text-white/80">No stream configured</p>
                <p className="mt-1 text-xs text-white/50">Set VITE_LIVE_VIDEO_URL in .env</p>
              </div>
            )}
          </button>
        )}
      </div>

      {/* Audio / Listen Live */}
      <div className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5">
        <Radio className="h-4 w-4 shrink-0 text-brand-yellow" />
        <span className="text-xs font-bold uppercase tracking-wider text-white/80">Listen Live</span>
        {audioUrl ? (
          <audio controls src={audioUrl} className="ml-auto h-8 flex-1" aria-label="Live radio stream" />
        ) : (
          <span className="ml-auto text-xs text-slate-500">No audio stream configured</span>
        )}
      </div>
    </div>
  );
}

