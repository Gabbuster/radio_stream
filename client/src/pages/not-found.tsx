import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="bg-card w-full max-w-md mx-4 p-8 rounded-2xl border border-border shadow-2xl shadow-primary/10 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
        </div>
        
        <h1 className="text-4xl font-display font-black text-foreground mb-2 tracking-wider">404</h1>
        <p className="text-xl font-mono text-primary mb-6">SIGNAL LOST</p>
        
        <p className="text-muted-foreground mb-8 font-light">
          The frequency you are trying to reach does not exist in this sector.
        </p>

        <Link href="/" className="inline-flex items-center justify-center w-full px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all duration-300">
          RETURN TO BASE
        </Link>
      </div>
    </div>
  );
}
