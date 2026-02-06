import { useMemo } from "react";
import { useStations } from "@/hooks/use-stations";
import { StationCard } from "@/components/StationCard";
import { Header } from "@/components/Header";
import { type Station } from "@shared/schema";
import { motion } from "framer-motion";
import { useAudio } from "@/contexts/AudioContext";

const getCountryFlag = (country: string | null) => {
  switch (country?.toLowerCase()) {
    case 'italy': return '🇮🇹';
    case 'spain': return '🇪🇸';
    case 'brazil': return '🇧🇷';
    case 'usa': return '🇺🇸';
    default: return '🌐';
  }
};

export default function Home() {
  const { data: stations, isLoading, error } = useStations();
  const { currentStation } = useAudio();

  const stationsByCountry = useMemo(() => {
    if (!stations) return {};
    
    const order = ['italy', 'spain', 'brazil', 'usa'];
    const grouped: Record<string, Station[]> = {};
    
    stations.forEach(station => {
      const country = station.country || 'Other';
      const key = country.toLowerCase();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(station);
    });

    const sortedKeys = Object.keys(grouped).sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });

    const sortedGrouped: Record<string, Station[]> = {};
    sortedKeys.forEach(key => sortedGrouped[key] = grouped[key]);
    
    return sortedGrouped;
  }, [stations]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-primary/20 blur-md animate-pulse" />
            </div>
          </div>
          <p className="text-primary font-mono tracking-widest animate-pulse text-sm">
            INITIALIZING SYSTEM...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center px-4">
        <div className="max-w-md p-8 glass-panel rounded-2xl border-destructive/50">
          <h2 className="text-3xl font-display font-bold text-destructive mb-4">SYSTEM FAILURE</h2>
          <p className="text-muted-foreground mb-6">Unable to establish connection to the frequency network.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-destructive text-destructive-foreground rounded-lg font-bold hover:bg-destructive/90 transition-colors"
            data-testid="button-reload"
          >
            REBOOT SYSTEM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen relative overflow-hidden ${currentStation ? 'pb-28' : 'pb-12'}`}>
      <div className="fixed top-20 left-10 w-2 h-20 bg-gradient-to-b from-primary/0 via-primary/50 to-primary/0 hidden lg:block opacity-30" />
      <div className="fixed bottom-40 right-10 w-2 h-40 bg-gradient-to-b from-secondary/0 via-secondary/50 to-secondary/0 hidden lg:block opacity-30" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Header />

        <div className="space-y-16 mt-8">
          {Object.entries(stationsByCountry).map(([countryKey, countryStations], idx) => {
            const countryName = countryStations[0]?.country || 'Unknown';
            return (
              <motion.section 
                key={countryKey}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-[2px] w-8 bg-gradient-to-r from-transparent to-primary" />
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-3 uppercase tracking-wider">
                    <span className="text-4xl filter drop-shadow-lg">{getCountryFlag(countryName)}</span>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                      {countryName}
                    </span>
                  </h2>
                  <div className="h-[2px] flex-1 bg-gradient-to-r from-primary/50 to-transparent opacity-30" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {countryStations.map((station) => (
                    <StationCard
                      key={station.id}
                      station={station}
                    />
                  ))}
                </div>
              </motion.section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
