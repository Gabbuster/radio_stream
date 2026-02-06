import { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode } from "react";
import Hls from "hls.js";
import { type Station } from "@shared/schema";

interface NowPlaying {
  title: string;
  artist: string;
  artwork?: string | null;
  albumName?: string | null;
}

interface AudioContextType {
  currentStation: Station | null;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  nowPlaying: NowPlaying | null;
  error: string | null;
  isLoading: boolean;
  playStation: (station: Station) => void;
  togglePlay: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  stop: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}

interface AudioProviderProps {
  children: ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const metadataIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.crossOrigin = "anonymous";
    
    audioRef.current.addEventListener("error", () => {
      setError("Stream connection failed");
      setIsLoading(false);
    });

    audioRef.current.addEventListener("canplay", () => {
      setIsLoading(false);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const fetchArtwork = useCallback(async (artist: string | null, title: string | null) => {
    try {
      const params = new URLSearchParams();
      if (artist) params.set("artist", artist);
      if (title) params.set("title", title);
      
      const res = await fetch(`/api/artwork?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        return {
          artwork: data.artwork || null,
          albumName: data.albumName || null,
        };
      }
    } catch (e) {}
    return { artwork: null, albumName: null };
  }, []);

  const fetchMetadata = useCallback(async (stationId: number) => {
    try {
      const res = await fetch(`/api/stations/${stationId}/metadata`);
      if (res.ok) {
        const data = await res.json();
        if (data.title || data.artist) {
          const artworkData = await fetchArtwork(data.artist, data.title);
          setNowPlaying({ 
            title: data.title || "Unknown Track", 
            artist: data.artist || "Unknown Artist",
            artwork: artworkData.artwork,
            albumName: artworkData.albumName,
          });
        }
      }
    } catch (e) {}
  }, [fetchArtwork]);

  const playStation = useCallback((station: Station) => {
    if (!audioRef.current) return;

    if (currentStation?.id === station.id) {
      togglePlay();
      return;
    }

    setError(null);
    setIsLoading(true);
    setNowPlaying(null);
    setCurrentStation(station);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (metadataIntervalRef.current) {
      clearInterval(metadataIntervalRef.current);
    }

    const audio = audioRef.current;

    if (station.url.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(station.url);
        hls.attachMedia(audio);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsLoading(false);
          audio.play().then(() => setIsPlaying(true)).catch(console.error);
        });
        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            setError("Stream unavailable");
            setIsLoading(false);
          }
        });
      } else if (audio.canPlayType("application/vnd.apple.mpegurl")) {
        audio.src = station.url;
        audio.play().then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        }).catch(() => setIsLoading(false));
      }
    } else {
      audio.src = station.url;
      audio.play().then(() => {
        setIsPlaying(true);
        setIsLoading(false);
      }).catch(() => setIsLoading(false));
    }

    fetchMetadata(station.id);
    metadataIntervalRef.current = setInterval(() => fetchMetadata(station.id), 15000);
  }, [currentStation, fetchMetadata]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !currentStation) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
    }
  }, [isPlaying, currentStation]);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    setIsMuted(newVolume === 0);
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (metadataIntervalRef.current) {
      clearInterval(metadataIntervalRef.current);
    }
    setCurrentStation(null);
    setIsPlaying(false);
    setNowPlaying(null);
    setError(null);
  }, []);

  return (
    <AudioContext.Provider
      value={{
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
        stop,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}
