import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@/components/ui/slider";
import { type Station } from "@shared/schema";

interface AudioPlayerProps {
  currentStation: Station | null;
  isPlaying: boolean;
  onPlayPause: () => void;
}

export function AudioPlayer({ currentStation, isPlaying, onPlayPause }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [volume, setVolume] = useState([80]);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize Audio & HLS
  useEffect(() => {
    if (!currentStation) return;

    // Reset error state
    setError(null);

    // Destroy previous HLS instance if exists
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const audio = audioRef.current;
    if (!audio) return;

    const playAudio = async () => {
      try {
        if (currentStation.url.includes(".m3u8")) {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hlsRef.current = hls;
            hls.loadSource(currentStation.url);
            hls.attachMedia(audio);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              if (isPlaying) audio.play().catch(e => console.error("Play error:", e));
            });
            hls.on(Hls.Events.ERROR, (_, data) => {
              if (data.fatal) {
                 setError("Stream unavailable");
                 console.error("HLS Error:", data);
              }
            });
          } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
            audio.src = currentStation.url;
            if (isPlaying) audio.play();
          }
        } else {
          audio.src = currentStation.url;
          if (isPlaying) audio.play();
        }
      } catch (err) {
        console.error("Setup error:", err);
        setError("Could not load stream");
      }
    };

    playAudio();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [currentStation?.url]); // Only re-run if URL changes

  // Handle Play/Pause State
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((e) => {
          console.error("Playback failed:", e);
          // Don't set error here immediately, browsers block autoplay sometimes
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Handle Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume[0] / 100;
    }
  }, [volume, isMuted]);

  // Visualizer Setup
  useEffect(() => {
    if (!canvasRef.current || !audioRef.current || audioContextRef.current) return;

    try {
      // Create audio context only after user interaction (handled by play click usually)
      // but we initialize ref here for when it happens
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64; // Low resolution for retro bar look
      analyserRef.current = analyser;

      // Connect source - this requires CORS handling for some streams, might fail for cross-origin
      // For this demo, we'll try/catch. If CORS fails, visualizer just won't move.
      try {
        const source = audioCtx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
      } catch (e) {
        console.warn("Visualizer disabled due to CORS:", e);
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          barHeight = (dataArray[i] / 255) * canvas.height;
          
          // Neon gradient
          const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
          gradient.addColorStop(0, "rgba(0, 243, 255, 0.2)");
          gradient.addColorStop(1, "rgba(255, 0, 110, 0.8)");
          
          ctx.fillStyle = gradient;
          
          // Draw rounded top bars
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
          
          x += barWidth;
        }
      };

      draw();

    } catch (e) {
      console.error("Audio Context Error:", e);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
      audioContextRef.current = null;
    };
  }, []);

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10"
    >
      <audio 
        ref={audioRef} 
        className="hidden" 
        crossOrigin="anonymous" 
        onError={() => setError("Stream connection failed")}
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between gap-4">
        
        {/* Info Section */}
        <div className="flex items-center gap-4 w-1/3 min-w-0">
          <div className={`
            relative w-14 h-14 rounded-xl flex items-center justify-center text-3xl
            bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10
            ${isPlaying ? 'animate-pulse-glow shadow-[0_0_15px_rgba(0,243,255,0.3)]' : ''}
          `}>
            {currentStation?.icon || <Radio className="w-6 h-6 text-primary" />}
            
            {isPlaying && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
          </div>
          
          <div className="flex flex-col min-w-0">
            <h3 className="text-lg font-display font-bold text-white truncate leading-none mb-1">
              {currentStation ? currentStation.name : "SELECT A STATION"}
            </h3>
            <p className="text-xs font-mono text-primary tracking-widest uppercase">
              {error ? (
                <span className="text-destructive font-bold animate-pulse">{error}</span>
              ) : isPlaying ? (
                <span className="flex items-center gap-2">
                  LIVE SIGNAL <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/>
                </span>
              ) : (
                "SYSTEM STANDBY"
              )}
            </p>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col items-center justify-center w-1/3">
          <div className="flex items-center gap-6">
            <button 
              onClick={onPlayPause}
              disabled={!currentStation}
              className={`
                w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                disabled:opacity-50 disabled:cursor-not-allowed
                ${isPlaying 
                  ? 'bg-gradient-to-r from-secondary to-red-500 shadow-[0_0_30px_rgba(255,0,110,0.4)] hover:shadow-[0_0_40px_rgba(255,0,110,0.6)]' 
                  : 'bg-gradient-to-r from-primary to-blue-500 shadow-[0_0_30px_rgba(0,243,255,0.4)] hover:shadow-[0_0_40px_rgba(0,243,255,0.6)]'
                }
                hover:scale-105 active:scale-95
              `}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white fill-current" />
              ) : (
                <Play className="w-8 h-8 text-white fill-current ml-1" />
              )}
            </button>
          </div>
        </div>

        {/* Volume & Visualizer Section */}
        <div className="flex items-center justify-end gap-6 w-1/3">
           {/* Canvas Visualizer */}
          <div className="hidden md:block h-12 w-32 relative opacity-60">
            <canvas ref={canvasRef} width="128" height="48" className="w-full h-full" />
          </div>

          <div className="flex items-center gap-3 w-32 group">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="text-muted-foreground hover:text-white transition-colors"
            >
              {isMuted || volume[0] === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <Slider
              value={isMuted ? [0] : volume}
              min={0}
              max={100}
              step={1}
              onValueChange={(val) => {
                setVolume(val);
                setIsMuted(val[0] === 0);
              }}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
      
      {/* Progress Line Animation */}
      {isPlaying && (
        <motion.div 
          className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-primary via-purple-500 to-secondary w-full"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1 }}
        />
      )}
    </motion.div>
  );
}
