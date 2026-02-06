import { memo } from "react";

interface AudioVisualizerProps {
  isPlaying: boolean;
  hasArtwork: boolean;
}

export const AudioVisualizer = memo(function AudioVisualizer({ isPlaying, hasArtwork }: AudioVisualizerProps) {
  const baseSize = hasArtwork ? 256 : 160;
  const ringCount = 5;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {Array.from({ length: ringCount }).map((_, i) => {
        const scale = 1 + (i + 1) * 0.18;
        const opacity = 0.6 - i * 0.1;
        const hue = 183 + i * 20;
        const animationDelay = `${i * 0.15}s`;
        const animationDuration = `${2 + i * 0.5}s`;
        
        return (
          <div
            key={i}
            className={`absolute rounded-2xl transition-opacity duration-500 ${isPlaying ? 'animate-pulse-ring' : ''}`}
            style={{
              width: baseSize,
              height: baseSize,
              transform: `scale(${scale})`,
              border: `2px solid hsla(${hue}, 100%, 50%, ${opacity})`,
              opacity: isPlaying ? opacity : 0.15,
              boxShadow: isPlaying 
                ? `0 0 20px hsla(${hue}, 100%, 50%, 0.3), inset 0 0 10px hsla(${hue}, 100%, 50%, 0.1)`
                : 'none',
              animationDelay,
              animationDuration,
            }}
          />
        );
      })}
    </div>
  );
});

export const WaveformBars = memo(function WaveformBars({ isPlaying }: { isPlaying: boolean }) {
  const barCount = 24;
  
  return (
    <div className="flex items-end justify-center gap-[3px] h-12 w-full max-w-sm mx-auto px-4">
      {Array.from({ length: barCount }).map((_, i) => {
        const centerOffset = Math.abs(i - barCount / 2) / (barCount / 2);
        const baseHeight = 20 + (1 - centerOffset) * 30;
        const animationDelay = `${i * 0.05}s`;
        const hue = 183 + (i / barCount) * 80;
        
        return (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-300 ${isPlaying ? 'animate-equalizer' : ''}`}
            style={{
              height: isPlaying ? `${baseHeight}%` : '15%',
              background: `linear-gradient(to top, hsl(${hue}, 100%, 50%), hsl(334, 100%, 50%))`,
              opacity: isPlaying ? 0.85 : 0.3,
              animationDelay,
            }}
          />
        );
      })}
    </div>
  );
});
