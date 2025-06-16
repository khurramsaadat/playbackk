"use client";
import { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ComponentType } from "react";
import type { WaveSurferComponentProps } from "../components/WaveSurferComponent";
import { Slider } from "@/components/ui/slider";
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';

const WaveSurferComponent = dynamic(() =>
  import("../components/WaveSurferComponent") as Promise<{ default: ComponentType<WaveSurferComponentProps> }>
, { ssr: false });

export default function Home() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [abMarkers, setAbMarkers] = useState<{ a: number; b: number }>({ a: 0, b: 0 });
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [centerOnAB, setCenterOnAB] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isCutting, setIsCutting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [cutProgress, setCutProgress] = useState<number>(0);
  const [outputFormat, setOutputFormat] = useState('mp4');
  const [message, setMessage] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [processing, setProcessing] = useState<boolean>(false);

  // Store looping handler refs to allow cleanup
  const loopingHandlerRef = useRef<(() => void) | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoUrl(url);
      setAudioUrl(url); // For now, use the same URL for both video and audio
      setFileName(file.name);
    }
  };

  // Track play/pause state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const { a, b } = abMarkers;
    // Only loop if both markers are set and valid
    if (a < b) {
      // Remove any previous looping listeners
      if (loopingHandlerRef.current) {
        loopingHandlerRef.current();
        loopingHandlerRef.current = null;
      }
      // Always jump to A and play
      video.currentTime = a;
      video.play();
      const onTimeUpdate = () => {
        if (video.currentTime >= b) {
          video.currentTime = a;
          video.play();
        }
      };
      const onPause = () => {
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.removeEventListener('pause', onPause);
      };
      video.addEventListener('timeupdate', onTimeUpdate);
      video.addEventListener('pause', onPause);
      loopingHandlerRef.current = () => {
        video.removeEventListener('timeupdate', onTimeUpdate);
        video.removeEventListener('pause', onPause);
      };
    } else {
      // If markers are not valid, remove looping listeners
      if (loopingHandlerRef.current) {
        loopingHandlerRef.current();
        loopingHandlerRef.current = null;
      }
    }
    // Cleanup on unmount or abMarkers change
    return () => {
      if (loopingHandlerRef.current) {
        loopingHandlerRef.current();
        loopingHandlerRef.current = null;
      }
    };
  }, [abMarkers, videoRef, duration]);

  // Ensure isPlaying state always matches the actual video state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, [videoRef, audioUrl]);

  // Helper to get the green color from CSS variable
  function getPrimaryColor() {
    if (typeof window !== 'undefined') {
      return getComputedStyle(document.documentElement).getPropertyValue('--primary') || '#22c55e';
    }
    return '#22c55e';
  }

  // Helper to show toast
  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Convert seconds to human readable time format (e.g., 1h05m30s, 10m30s, 30s)
  function formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    let timeString = '';
    if (hours > 0) {
      timeString += `${hours}h`;
      timeString += minutes.toString().padStart(2, '0') + 'm';
      timeString += remainingSeconds.toString().padStart(2, '0') + 's';
    } else if (minutes > 0) {
      timeString += `${minutes}m`;
      timeString += remainingSeconds.toString().padStart(2, '0') + 's';
    } else {
      timeString += `${remainingSeconds}s`;
    }
    return timeString;
  }

  // Helper to cut and download video
  const handleCutAndDownload = async () => {
    if (!videoRef.current || !fileName || abMarkers.a >= abMarkers.b) {
      setMessage("Invalid A/B points or no file.");
      return;
    }
    const inputElem = document.getElementById('file-upload') as HTMLInputElement | null;
    const file = inputElem?.files?.[0];
    
    if (!file) {
      setMessage("No file selected.");
      return;
    }

    const start = abMarkers.a;
    const end = abMarkers.b;

    // Generate filename with formatted time
    const originalName = fileName.replace(/\.[^/.]+$/, ''); // Remove extension
    const newFilename = `${originalName}-${formatTime(start)}-${formatTime(end)}.mp4`;

    setIsCutting(true);
    setMessage("Processing...");
    setProgress(0);

    try {
      // Check for SharedArrayBuffer support
      if (typeof SharedArrayBuffer === 'undefined' || !crossOriginIsolated) {
        throw new Error('Your browser does not support the required features. Please ensure Cross-Origin Isolation is enabled.');
      }

      const ffmpeg = new FFmpeg();
      console.log('Loading FFmpeg...');
      
      // Load FFmpeg with proper core files
      await ffmpeg.load({
        coreURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm', 'application/wasm'),
      });
      console.log('FFmpeg loaded');

      // Log progress
      ffmpeg.on('progress', ({ progress, time }) => {
        const percent = Math.round(progress * 100);
        setProgress(percent);
        console.log('Processing: ', percent, '%');
        console.log('Time: ', time);
      });

      // Write input file
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));
      console.log('File written');

      // Execute FFmpeg command with improved settings
      await ffmpeg.exec([
        '-ss', start.toString(),
        '-i', 'input.mp4',
        '-t', (end - start).toString(),
        '-c:v', 'libx264',  // Use H.264 codec
        '-preset', 'ultrafast',  // Fastest encoding
        '-crf', '23',  // Balance quality and size
        '-c:a', 'aac',  // Use AAC for audio
        '-b:a', '128k',  // Audio bitrate
        '-movflags', '+faststart',  // Enable fast start for web playback
        'output.mp4'
      ]);
      console.log('FFmpeg command executed');

      // Read the output file
      const data = await ffmpeg.readFile('output.mp4');
      console.log('Output file read');

      // Create download
      const blob = new Blob([data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      
      const aEl = document.createElement('a');
      aEl.href = url;
      aEl.download = newFilename;
      document.body.appendChild(aEl);
      aEl.click();
      document.body.removeChild(aEl);
      
      // Cleanup
      URL.revokeObjectURL(url);
      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');
      
      setMessage("Download ready!");
      setProgress(100);
      showToast('success', 'Video cut and downloaded successfully!');
    } catch (err) {
      console.error("FFmpeg error:", err);
      setMessage(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      setProgress(0);
      showToast('error', 'Failed to cut video. Please try again.');
    } finally {
      setIsCutting(false);
    }
  };

  // Add useEffect to listen for messages from the micro-app
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      // For local testing, accept all origins. For production, check event.origin.
      if (event.data.status === 'success') {
        showToast('success', 'Video cut and download ready!');
        setIsCutting(false);
        setCutProgress(100);
      } else if (event.data.status === 'error') {
        showToast('error', 'Video cutting failed: ' + event.data.message);
        setIsCutting(false);
        setCutProgress(0);
      } else if (event.data.status === 'progress') {
        setCutProgress(event.data.progress);
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const handleTimeUpdate = (time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  return (
    <>
      <iframe
        id="video-cutter-iframe"
        src="/video-cutter/index.html"
        style={{ 
          width: "100%", 
          height: 0, 
          border: 'none',
          visibility: 'hidden',
          position: 'absolute' 
        }}
        title="Video Cutter Micro-App"
      />
      <div className="min-h-screen flex flex-col items-center justify-start bg-background p-0 sm:p-2">
        <Card className="w-full max-w-md sm:max-w-2xl p-2 sm:p-4 flex flex-col gap-4 shadow-lg mt-0">
          <h1 className="text-2xl font-bold text-primary mb-2 text-center">Playback & Learn</h1>
          
          {/* File Input Section */}
          <div className="w-full flex flex-row items-center gap-2 mb-4">
            <label 
              htmlFor="file-upload" 
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-md cursor-pointer shadow-md transition-colors"
            >
              Choose File
              <input
                id="file-upload"
                type="file"
                accept="video/*,audio/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={isPlaying}
              />
            </label>
            <div className="text-sm text-muted-foreground truncate w-full bg-slate-100 p-2 rounded-md">
              {fileName || 'No file selected'}
            </div>
          </div>

          {/* Video Container */}
          <div className="w-full aspect-video bg-slate-100 rounded-lg overflow-hidden relative mb-4">
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-contain bg-black"
                controls
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <span className="text-lg">No video loaded</span>
                <span className="text-xs">Upload a video or audio file</span>
              </div>
            )}
          </div>

          {/* Waveform Container */}
          <div className="w-full h-32 bg-slate-100 rounded-lg relative mb-4">
            {audioUrl ? (
              <WaveSurferComponent
                audioUrl={audioUrl}
                onTimeUpdate={handleTimeUpdate}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                abMarkers={abMarkers}
                setAbMarkers={setAbMarkers}
                videoRef={videoRef}
                duration={duration}
                setDuration={setDuration}
                zoom={zoom}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500">
                <span className="text-lg">No Audio loaded</span>
                <span className="text-xs">Upload a video or audio file</span>
              </div>
            )}
          </div>

          {/* Zoom Controls */}
          <div className="w-full flex flex-row items-center gap-2 mb-4">
            <span className="text-sm text-slate-500">Zoom</span>
            <Slider
              min={1}
              max={5}
              step={0.1}
              value={[zoom]}
              onValueChange={([val]) => setZoom(val)}
              className="w-32"
            />
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setZoom(1)}
              className="ml-2"
            >
              Reset Zoom
            </Button>
          </div>

          {/* Controls */}
          <div className="flex flex-row gap-4 w-full justify-center mt-4">
            <Button 
              size="default" 
              variant="destructive" 
              onClick={() => setAbMarkers({ a: 0, b: duration })} 
              disabled={!audioUrl || isPlaying} 
              aria-label="Clear A/B Markers"
              className="bg-red-400 hover:bg-red-500 text-white shadow-md"
            >
              Clear A/B
            </Button>
            {/* Cut & Download Button */}
            <Button
              type="button"
              className={`bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md transition-all duration-200
                ${(!audioUrl || abMarkers.a >= abMarkers.b || isCutting || isPlaying) ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}
              `}
              disabled={!audioUrl || abMarkers.a >= abMarkers.b || isCutting || isPlaying}
              onClick={handleCutAndDownload}
              aria-label="Cut & Download"
            >
              {isCutting ? (
                <div className="flex items-center gap-2">
                  <span>Processing {progress}%</span>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/>
                </div>
              ) : (
                "Cut & Download"
              )}
            </Button>
          </div>
        </Card>
        {toast && (
          <div
            style={{
              position: 'fixed',
              bottom: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              background: getPrimaryColor(),
              color: '#fff',
              padding: '1rem 2rem',
              borderRadius: 8,
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
              fontWeight: 600,
              zIndex: 9999,
              minWidth: 200,
              textAlign: 'center',
              opacity: 0.98,
            }}
            role="alert"
          >
            {toast.message}
          </div>
        )}
      </div>
    </>
  );
}
