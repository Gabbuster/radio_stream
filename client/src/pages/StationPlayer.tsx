import { useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, VolumeX, ArrowLeft, Radio, Music, Disc3 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { type Station } from "@shared/schema";
import { useAudio } from "@/contexts/AudioContext";
import { AudioVisualizer, WaveformBars } from "@/components/AudioVisualizer";

export default function StationPlayer() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  
  const { data: stations } = useQuery<Station[]>({
    queryKey: ["/api/stations"],
  });
  
  const station = stations?.find(s => s.id === Number(id));
  
  const {
    currentStation,
    isPlaying,
    volume,
    isMuted,
    nowPlaying,
    error,
    isLoading,
    playStation,
    togglePlay,
    setVolume,
    toggleMute,
  } = useAudio();

  useEffect(() => {
    if (station && currentStation?.id !== station.id) {
      playStation(station);
    }
  }, [station?.id]);

  if (!station) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full border-4 border-primary/30 border-t-primary mx-auto mb-4 animate-spin" />
          <p className="text-primary font-mono tracking-widest text-sm">TUNING FREQUENCY...</p>
        </div>
      </div>
    );
  }

  const isThisStationPlaying = currentStation?.id === station.id && isPlaying;
  const hasArtwork = !!(nowPlaying?.artwork && currentStation?.id === station.id);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      {/* Static Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        
        {/* Background Blobs - CSS animations only */}
        <div 
          className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/15 blur-[150px] transition-opacity duration-1000 ${isThisStationPlaying ? 'opacity-25 animate-pulse' : 'opacity-10'}`}
        />
        <div 
          className={`absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-secondary/15 blur-[120px] transition-opacity duration-1000 ${isThisStationPlaying ? 'opacity-25 animate-pulse' : 'opacity-10'}`}
          style={{ animationDelay: '1s' }}
        />

        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(0,243,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,243,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-20 p-4 sm:p-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/")}
          className="text-muted-foreground hover:text-white gap-2"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Stations</span>
        </Button>

        {/* Live Badge */}
        {isThisStationPlaying && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/20 border border-red-500/30">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs font-mono text-red-400 tracking-wider">LIVE</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 -mt-16">
        {/* Album Artwork / Station Icon with Audio Visualizer */}
        <div className="relative mb-8">
          <AudioVisualizer isPlaying={isThisStationPlaying} hasArtwork={hasArtwork} />
          
          <div className="relative z-10">
            <AnimatePresence mode="wait">
              {hasArtwork ? (
                <motion.div
                  key="artwork"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <div
                    className={`w-48 h-48 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl transition-shadow duration-500 ${isThisStationPlaying ? 'shadow-[0_0_60px_rgba(0,243,255,0.3)]' : ''}`}
                  >
                    <img 
                      src={nowPlaying?.artwork || ''} 
                      alt="Album artwork"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="icon"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className={`
                    w-32 h-32 sm:w-40 sm:h-40 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl
                    bg-gradient-to-br from-card/90 to-card/50 backdrop-blur-xl
                    border-2 border-white/10 shadow-2xl relative overflow-hidden
                    transition-shadow duration-500
                    ${isThisStationPlaying ? 'shadow-[0_0_40px_rgba(0,243,255,0.3)]' : ''}
                  `}
                >
                  {station.icon || <Radio className="w-14 h-14 text-primary" />}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Station Info */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-white tracking-wide mb-1">
            {station.name}
          </h1>
          <div className="flex items-center justify-center gap-2">
            <Disc3 className="w-3 h-3 text-primary" />
            <p className="text-primary font-mono text-xs sm:text-sm tracking-widest uppercase">
              {station.country}
            </p>
          </div>
        </div>

        {/* Waveform Visualization */}
        <div className="w-full mb-6">
          <WaveformBars isPlaying={isThisStationPlaying} />
        </div>

        {/* Error State */}
        {error && currentStation?.id === station.id && (
          <div className="text-destructive font-mono text-sm mb-4 px-4 py-2 bg-destructive/10 rounded-lg border border-destructive/30">
            {error}
          </div>
        )}

        {/* Play Button */}
        <div className="relative mb-6">
          {/* Button Glow */}
          <div
            className={`absolute inset-0 rounded-full blur-xl transition-all duration-500 ${isThisStationPlaying ? 'bg-secondary/50 animate-pulse' : 'bg-primary/30'}`}
          />
          
          <button
            onClick={() => {
              if (currentStation?.id === station.id) {
                togglePlay();
              } else {
                playStation(station);
              }
            }}
            disabled={isLoading && currentStation?.id === station.id}
            className={`
              relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center
              transition-all duration-300
              ${isLoading && currentStation?.id === station.id ? 'opacity-50 cursor-wait' : 'hover:scale-105 active:scale-95'}
              ${isThisStationPlaying 
                ? 'bg-gradient-to-br from-secondary via-pink-500 to-red-500' 
                : 'bg-gradient-to-br from-primary via-cyan-400 to-blue-500'
              }
              shadow-lg
            `}
            data-testid="button-play-pause"
          >
            {isLoading && currentStation?.id === station.id ? (
              <div className="w-10 h-10 rounded-full border-4 border-white/30 border-t-white animate-spin" />
            ) : isThisStationPlaying ? (
              <Pause className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-current" />
            ) : (
              <Play className="w-10 h-10 sm:w-12 sm:h-12 text-white fill-current ml-1" />
            )}
          </button>
        </div>

        {/* Controls Container */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md mb-6">
          {/* Volume Control */}
          <div className="flex items-center gap-4 flex-1 w-full px-4 py-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <button 
              onClick={toggleMute}
              className="text-muted-foreground hover:text-white transition-colors"
              data-testid="button-mute"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={(val) => setVolume(val[0])}
              className="flex-1"
              data-testid="slider-volume"
            />
            <span className="text-xs font-mono text-muted-foreground w-8 text-right">
              {isMuted ? 0 : volume}%
            </span>
          </div>
          
        </div>

        {/* Now Playing Info */}
        <AnimatePresence mode="wait">
          {nowPlaying && currentStation?.id === station.id && (
            <motion.div
              key={nowPlaying.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-center px-4 py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 max-w-md w-full"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Music className={`w-4 h-4 text-primary ${isThisStationPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                <span className="text-xs font-mono text-primary tracking-wider">NOW PLAYING</span>
              </div>
              <p className="text-white font-bold text-lg sm:text-xl mb-1 line-clamp-1">{nowPlaying.title}</p>
              <p className="text-primary text-sm sm:text-base">{nowPlaying.artist}</p>
              {nowPlaying.albumName && (
                <p className="text-muted-foreground text-xs mt-1 line-clamp-1">{nowPlaying.albumName}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Gradient */}
      <div className="fixed bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none z-5" />
    </div>
  );
}
