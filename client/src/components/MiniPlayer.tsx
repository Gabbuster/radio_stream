import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, X, Radio, Volume2, VolumeX } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";
import { useLocation } from "wouter";
import { Slider } from "@/components/ui/slider";

export function MiniPlayer() {
  const { 
    currentStation, 
    isPlaying, 
    togglePlay, 
    stop, 
    nowPlaying,
    error,
    isLoading,
    volume,
    setVolume,
    isMuted,
    toggleMute
  } = useAudio();
  const [location, navigate] = useLocation();

  // Don't show mini player on station page (it has its own controls)
  const isOnStationPage = location.startsWith("/station/");
  
  if (!currentStation || isOnStationPage) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/10"
      >
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between gap-4">
          {/* Station Info - Clickable */}
          <button
            onClick={() => navigate(`/station/${currentStation.id}`)}
            className="flex items-center gap-3 flex-1 min-w-0 text-left group"
            data-testid="mini-player-info"
          >
            {nowPlaying?.artwork ? (
              <div className={`
                w-12 h-12 rounded-lg overflow-hidden border border-white/10
                group-hover:border-primary/50 transition-colors
                ${isPlaying ? 'shadow-[0_0_15px_rgba(0,243,255,0.3)]' : ''}
              `}>
                <img 
                  src={nowPlaying.artwork} 
                  alt="Album artwork"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center text-2xl
                bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10
                group-hover:border-primary/50 transition-colors
                ${isPlaying ? 'shadow-[0_0_15px_rgba(0,243,255,0.3)]' : ''}
              `}>
                {currentStation.icon || <Radio className="w-5 h-5 text-primary" />}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-display font-bold text-white truncate text-sm group-hover:text-primary transition-colors">
                {currentStation.name}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                {error ? (
                  <span className="text-destructive">{error}</span>
                ) : nowPlaying ? (
                  <span>{nowPlaying.artist} - {nowPlaying.title}</span>
                ) : isPlaying ? (
                  <span className="text-primary">Live</span>
                ) : (
                  <span>Paused</span>
                )}
              </p>
            </div>
          </button>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2 w-32">
            <button 
              onClick={toggleMute}
              className="text-muted-foreground hover:text-white transition-colors"
              data-testid="mini-player-mute"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={(val) => setVolume(val[0])}
              className="flex-1"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={togglePlay}
              disabled={isLoading}
              className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all
                ${isLoading ? 'opacity-50' : 'hover:scale-105 active:scale-95'}
                ${isPlaying 
                  ? 'bg-gradient-to-r from-secondary to-red-500' 
                  : 'bg-gradient-to-r from-primary to-cyan-400'
                }
              `}
              data-testid="mini-player-play"
            >
              {isLoading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-5 h-5 text-white fill-current" />
              ) : (
                <Play className="w-5 h-5 text-white fill-current ml-0.5" />
              )}
            </button>
            
            <button
              onClick={stop}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
              data-testid="mini-player-stop"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Progress Line */}
        {isPlaying && (
          <motion.div 
            className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-primary via-purple-500 to-secondary"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
