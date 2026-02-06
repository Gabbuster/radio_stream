import { type Station } from "@shared/schema";
import { motion } from "framer-motion";
import { Play, Pause, Radio } from "lucide-react";
import { useLocation } from "wouter";
import { useAudio } from "@/contexts/AudioContext";

interface StationCardProps {
  station: Station;
}

const getGlowColor = (country: string | null) => {
  switch (country?.toLowerCase()) {
    case 'italy': return { from: '16, 185, 129', to: '239, 68, 68' };
    case 'spain': return { from: '251, 191, 36', to: '220, 38, 38' };
    case 'brazil': return { from: '34, 197, 94', to: '250, 204, 21' };
    case 'usa': return { from: '59, 130, 246', to: '239, 68, 68' };
    default: return { from: '0, 243, 255', to: '255, 0, 128' };
  }
};

export function StationCard({ station }: StationCardProps) {
  const [, navigate] = useLocation();
  const { currentStation, isPlaying } = useAudio();
  const isActive = currentStation?.id === station.id;
  const glowColors = getGlowColor(station.country);
  
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/station/${station.id}`)}
      data-testid={`card-station-${station.id}`}
      className="relative cursor-pointer group"
    >
      {/* Neon Glow Background */}
      <div 
        className={`
          absolute -inset-1 rounded-2xl opacity-0 blur-xl transition-opacity duration-500
          ${isActive ? 'opacity-60' : 'group-hover:opacity-40'}
        `}
        style={{
          background: `linear-gradient(135deg, rgba(${glowColors.from}, 0.8), rgba(${glowColors.to}, 0.8))`
        }}
      />
      
      {/* Liquid Glass Card */}
      <div className={`
        relative overflow-hidden rounded-xl p-3 sm:p-4
        backdrop-blur-xl border transition-all duration-300
        ${isActive 
          ? 'bg-white/15 border-white/30 shadow-lg' 
          : 'bg-white/[0.08] border-white/[0.12] hover:bg-white/[0.12] hover:border-white/20'
        }
      `}>
        {/* Glass Refraction Effect */}
        <div className="absolute inset-0 overflow-hidden rounded-xl">
          <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-white/10 to-transparent rotate-12 opacity-50" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex items-center gap-3">
          {/* Icon Container */}
          <div className={`
            relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-lg
            flex items-center justify-center text-2xl sm:text-3xl
            transition-all duration-300
            ${isActive 
              ? 'bg-white/20 shadow-inner' 
              : 'bg-white/5 group-hover:bg-white/10'
            }
          `}>
            {/* Animated ring for active */}
            {isActive && isPlaying && (
              <motion.div
                className="absolute inset-0 rounded-lg border-2 border-primary"
                animate={{ 
                  boxShadow: ['0 0 0 0 rgba(0, 243, 255, 0.4)', '0 0 0 8px rgba(0, 243, 255, 0)']
                }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity,
                  ease: "easeOut"
                }}
              />
            )}
            <span className={`
              transform transition-transform duration-300
              ${isActive ? 'scale-110' : 'group-hover:scale-105'}
            `}>
              {station.icon || <Radio className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />}
            </span>
          </div>

          {/* Station Info */}
          <div className="flex-1 min-w-0">
            <h3 className={`
              font-semibold text-sm sm:text-base truncate transition-colors duration-300
              ${isActive ? 'text-primary' : 'text-white group-hover:text-primary/90'}
            `}>
              {station.name}
            </h3>
            {station.genre && (
              <p className="text-xs text-white/40 truncate mt-0.5">
                {station.genre}
              </p>
            )}
          </div>

          {/* Play/Pause Indicator */}
          <div className={`
            flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
            transition-all duration-300 transform
            ${isActive 
              ? 'bg-primary text-black scale-100' 
              : 'bg-white/10 text-white/60 scale-0 group-hover:scale-100'
            }
          `}>
            {isActive && isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </div>
        </div>

        {/* Playing indicator bar */}
        {isActive && isPlaying && (
          <motion.div 
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
    </motion.div>
  );
}
