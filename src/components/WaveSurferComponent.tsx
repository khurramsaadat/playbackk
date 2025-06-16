"use client";
import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import type { MutableRefObject } from "react";
import RegionsPlugin from 'wavesurfer.js/dist/plugins/regions.esm.js';

interface WaveSurferComponentProps {
  audioUrl: string;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  abMarkers: { a: number; b: number };
  setAbMarkers: (markers: { a: number; b: number }) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  duration: number;
  setDuration: (duration: number) => void;
  onTimeUpdate?: (time: number) => void;
  onDuration?: (duration: number) => void;
  centerOnAB?: boolean;
  onCenterHandled?: () => void;
  zoom?: number;
}

export type { WaveSurferComponentProps };

export default function WaveSurferComponent({
  audioUrl,
  isPlaying,
  setIsPlaying,
  abMarkers,
  setAbMarkers,
  videoRef,
  duration,
  setDuration,
  onTimeUpdate,
  onDuration,
  centerOnAB = false,
  onCenterHandled,
  zoom = 1
}: WaveSurferComponentProps) {
  const waveRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!audioUrl || !waveRef.current) return;
    if (wsRef.current) {
      try {
        wsRef.current.destroy();
      } catch (e) {
        if (!(e instanceof DOMException && e.name === 'AbortError')) {
          console.error(e);
        }
        // Otherwise, ignore AbortError
      }
      wsRef.current = null;
    }
    wsRef.current = WaveSurfer.create({
      container: waveRef.current,
      waveColor: "#d1d5db",
      progressColor: "#d1d5db",
      height: 96,
      barWidth: 2,
      barGap: 2,
      cursorColor: "#15803d",
      interact: true,
      minPxPerSec: 40 * zoom,
    });
    // Register regions plugin and set region
    const regionsPlugin = RegionsPlugin.create();
    wsRef.current.registerPlugin(regionsPlugin);
    wsRef.current.load(audioUrl);
    wsRef.current.on("ready", () => {
      if (onDuration && wsRef.current) onDuration(wsRef.current.getDuration());
      // Only reset abMarkers if this is a new audioUrl (not just a zoom change)
      // Optionally, you can check if abMarkers.a === 0 && abMarkers.b === 0 to avoid overwriting user markers
    });
    // @ts-expect-error: 'seek' is a valid event in wavesurfer.js
    wsRef.current.on("seek", (progress: number) => {
      const duration = wsRef.current?.getDuration() || 0;
      const time = progress * duration;
      if (videoRef.current) videoRef.current.currentTime = time;
    });
    wsRef.current.on('audioprocess', () => {
      setCurrentTime(wsRef.current?.getCurrentTime() || 0);
    });
    return () => {
      if (wsRef.current) {
        try {
          wsRef.current.destroy();
        } catch (e) {
          if (!(e instanceof DOMException && e.name === 'AbortError')) {
            console.error(e);
          }
          // Otherwise, ignore AbortError
        }
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl, zoom]);

  // Update region and marker positions when abMarkers change
  useEffect(() => {
    if (!wsRef.current) return;
    const regionsPlugin = wsRef.current.getActivePlugins().find((p) => (p as { addRegion?: unknown }).addRegion);
    if (!regionsPlugin) return;
    // Remove the old region
    const oldRegion = (regionsPlugin as unknown as { getRegions: () => { id: string; remove: () => void }[] }).getRegions().find((r) => r.id === 'ab-region');
    if (oldRegion) {
      oldRegion.remove();
    }
    // Add the new region
    (regionsPlugin as unknown as { addRegion: (opts: object) => void }).addRegion({
      start: abMarkers.a,
      end: abMarkers.b,
      color: "rgba(34,197,94,0.3)",
      drag: false,
      resize: false,
      id: 'ab-region',
    });
    // Force re-render by updating state (if needed)
    // setCurrentTime(wsRef.current.getCurrentTime() || 0);
  }, [abMarkers.a, abMarkers.b]);

  // Sync video and waveform
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !wsRef.current) return;
    const onTimeUpdate = () => {
      if (!video || !wsRef.current) return;
      const time = video.currentTime;
      wsRef.current.seekTo(time / (wsRef.current.getDuration() || 1));
    };
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [videoRef, audioUrl]);

  // Center on A/B logic
  useEffect(() => {
    if (centerOnAB && wsRef.current && waveRef.current) {
      const duration = wsRef.current.getDuration();
      const a = abMarkers.a;
      const b = abMarkers.b;
      const container = waveRef.current;
      // Calculate the scroll position so A and B are at the edges
      const width = container.scrollWidth;
      const left = (a / duration) * width;
      const right = (b / duration) * width;
      // Center between A and B
      const center = (left + right) / 2;
      const scrollTo = Math.max(center - container.clientWidth / 2, 0);
      container.scrollTo({ left: scrollTo, behavior: "smooth" });
      if (onCenterHandled) onCenterHandled();
    }
  }, [centerOnAB, abMarkers, onCenterHandled]);

  // Helper to check if current time is near marker
  const isAtA = Math.abs(currentTime - abMarkers.a) < 0.2;
  const isAtB = Math.abs(currentTime - abMarkers.b) < 0.2;

  // Helper to format seconds as mm:ss
  function formatTime(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <div className="w-full flex flex-col items-center gap-2" style={{ height: '14rem', justifyContent: 'center' }}>
      <div ref={waveRef} className="w-full h-full bg-muted/30 rounded-lg relative flex items-center justify-center overflow-hidden" />
      {/* Marker set buttons */}
      <div className="flex gap-4 w-full justify-between text-sm mt-2 items-center px-2">
        <button
          className={`px-4 py-1.5 rounded-md transition-all duration-200 font-medium
            ${isAtA 
              ? "bg-green-600 text-white shadow-md" 
              : "bg-muted hover:bg-muted/80 text-foreground"} 
            hover:shadow-md`}
          onClick={() => setAbMarkers({ ...abMarkers, a: videoRef.current?.currentTime || 0 })}
        >
          Set A
        </button>
        <span className="flex items-center px-3 py-1.5 text-sm font-mono bg-muted/30 rounded-md">
          {formatTime(abMarkers.a)} - {formatTime(abMarkers.b)}
        </span>
        <button
          className={`px-4 py-1.5 rounded-md transition-all duration-200 font-medium
            ${isAtB 
              ? "bg-green-600 text-white shadow-md" 
              : "bg-muted hover:bg-muted/80 text-foreground"} 
            hover:shadow-md`}
          onClick={() => {
            setAbMarkers({ ...abMarkers, b: videoRef.current?.currentTime || 0 });
          }}
        >
          Set B
        </button>
      </div>
    </div>
  );
} 