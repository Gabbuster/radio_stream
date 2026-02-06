import { motion } from "framer-motion";
import { Radio } from "lucide-react";

export function Header() {
  return (
    <header className="py-12 relative z-10 text-center overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <Radio className="w-8 h-8 text-secondary animate-pulse" />
          <span className="text-primary font-mono text-sm tracking-[0.5em] uppercase border border-primary/30 px-3 py-1 rounded-full bg-primary/5">
            Global Frequency
          </span>
          <Radio className="w-8 h-8 text-secondary animate-pulse" />
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-black font-display tracking-tighter uppercase mb-2">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-secondary animate-pulse-glow">
            Cyber
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-white to-primary animate-pulse-glow ml-2 sm:ml-3 md:ml-4">
            Radio
          </span>
        </h1>
        
        <p className="text-muted-foreground font-mono text-sm md:text-base tracking-[0.3em] uppercase max-w-lg mx-auto">
          Tuning into the future signal
        </p>
      </motion.div>
    </header>
  );
}
