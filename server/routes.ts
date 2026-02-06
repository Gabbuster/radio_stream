import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { insertStationSchema } from "@shared/schema";

async function seedStations() {
  const existing = await storage.getStations();
  if (existing.length > 0) return;

  const stations = [
    // Italy
    { name: "RTL 102.5", url: "http://shoutcast.rtl.it:3010/stream/1/", icon: "📻", country: "Italy" },
    { name: "RDS", url: "https://stream.rds.radio/audio/rds.stream_aac/playlist.m3u8", icon: "🎵", country: "Italy" },
    { name: "Radio 105", url: "http://icecast.unitedradio.it/Radio105.mp3", icon: "🤪", country: "Italy" },
    { name: "Radio Monte Carlo", url: "https://icy.unitedradio.it/RMC.mp3", icon: "🍸", country: "Italy" },
    { name: "Radio Italia", url: "https://icy.unitedradio.it/RadioItalia.mp3", icon: "🇮🇹", country: "Italy" },
    { name: "Radio 24", url: "https://shoutcast.radio24.it/radio24.mp3", icon: "💼", country: "Italy" },
    { name: "Radio Kiss Kiss", url: "https://ice06.fluidstream.net/KissKiss.mp3", icon: "💋", country: "Italy" },
    { name: "Radio Deejay", url: "https://streamcdnb3-4c4b867c89244861ac216426883d1ad0.msvdn.net/radiodeejay/radiodeejay/master_ma.m3u8", icon: "🎧", country: "Italy" },
    { name: "Virgin Radio", url: "https://icecast.unitedradio.it/Virgin.mp3", icon: "🤘", country: "Italy" },
    { name: "Radio Subasio", url: "https://icy.unitedradio.it/Subasio.mp3", icon: "❤️", country: "Italy" },

    // Spain
    { name: "Los 40", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40.mp3", icon: "🔥", country: "Spain" },
    { name: "Cadena SER", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/CADENASER.mp3", icon: "📻", country: "Spain" },
    { name: "Onda Cero", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/ONDACERO.mp3", icon: "🟢", country: "Spain" },
    { name: "Cadena 100", url: "https://cadena100-cope-rrcast.flumotion.com/cope/cadena100.mp3", icon: "💯", country: "Spain" },
    { name: "Europa FM", url: "https://Europa-adnstream1.nice264.com/Europa-adnstream1", icon: "🇪🇺", country: "Spain" },
    { name: "Rock FM", url: "https://rockfm-cope-rrcast.flumotion.com/cope/rockfm.mp3", icon: "🎸", country: "Spain" },
    { name: "Kiss FM", url: "https://kissfm.kissfmradio.cires21.com/kissfm.mp3", icon: "💋", country: "Spain" },
    { name: "RNE Radio 1", url: "https://rtvelivestream.rtve.es/rne/rne_r1_main.m3u8", icon: "📡", country: "Spain" },
    { name: "Dial España", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/DIAL.mp3", icon: "🎶", country: "Spain" },

    // Brazil
    { name: "Jovem Pan", url: "https://r17.ciclano.io:15045/stream", icon: "🎙️", country: "Brazil" },
    { name: "Band FM", url: "https://8923.brasilstream.com.br/stream", icon: "🎵", country: "Brazil" },
    { name: "Antena 1", url: "https://antenaone.crossradio.com.br/stream/1;", icon: "📻", country: "Brazil" },
    { name: "Mix FM", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/RT_MIXFMAAC.aac", icon: "🎶", country: "Brazil" },
    { name: "Alpha FM", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/ALPHAFMAAC.aac", icon: "🌟", country: "Brazil" },
    { name: "CBN", url: "https://27863.live.streamtheworld.com/CBN_SPAAC.aac", icon: "📰", country: "Brazil" },
    { name: "Nativa FM", url: "https://24503.live.streamtheworld.com/NATIVA_FMAAC.aac", icon: "🇧🇷", country: "Brazil" },
    { name: "89 FM", url: "https://stream.89fm.com.br:8000/radio89.mp3", icon: "🎸", country: "Brazil" },
    { name: "Radio Globo", url: "https://noticias.radioglobo.com.br:8443/stream", icon: "🌎", country: "Brazil" },
    { name: "Kiss FM", url: "https://8903.brasilstream.com.br/stream", icon: "💋", country: "Brazil" },

    // USA
    { name: "KTU 103.5", url: "https://stream.revma.ihrhls.com/zc5205", icon: "💃", country: "USA" },
    { name: "Z100 NY", url: "https://stream.revma.ihrhls.com/zc181", icon: "🔥", country: "USA" },
    { name: "Hot 97 NY", url: "https://stream.revma.ihrhls.com/zc5173", icon: "🎤", country: "USA" },
    { name: "KEXP Seattle", url: "https://kexp-mp3-128.streamguys1.com/kexp128.mp3", icon: "🎸", country: "USA" },
    { name: "WFMU Jersey", url: "https://stream0.wfmu.org/freeform-128k", icon: "📻", country: "USA" },
    { name: "WNYC NY", url: "https://fm939.wnyc.org/wnycfm-web", icon: "🗽", country: "USA" },
    { name: "KCRW LA", url: "https://kcrw.streamguys1.com/kcrw_192k_mp3_on_air", icon: "🌴", country: "USA" },
    { name: "KUTX Austin", url: "https://streams.kut.org/4428_192.mp3", icon: "🤠", country: "USA" },
    { name: "WXPN Philly", url: "https://xpnlive.streamguys1.com/xpnlive", icon: "🎵", country: "USA" },
    { name: "WBGO Jazz", url: "https://wbgo.streamguys1.com/wbgo128", icon: "🎷", country: "USA" },
    { name: "NPR News", url: "https://npr-ice.streamguys1.com/live.mp3", icon: "🎙️", country: "USA" },
    { name: "SomaFM", url: "https://ice1.somafm.com/groovesalad-128-mp3", icon: "🌊", country: "USA" },
    { name: "Radio Paradise", url: "https://stream.radioparadise.com/aac-128", icon: "🎧", country: "USA" }
  ];

  for (const station of stations) {
    await storage.createStation(station);
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Seed stations on startup
  seedStations().catch(console.error);

  app.get(api.stations.list.path, async (req, res) => {
    const stations = await storage.getStations();
    res.json(stations);
  });

  app.post(api.stations.create.path, async (req, res) => {
    try {
      const input = api.stations.create.input.parse(req.body);
      const station = await storage.createStation(input);
      res.status(201).json(station);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      } else {
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Endpoint to search for album artwork
  app.get("/api/artwork", async (req, res) => {
    try {
      const { artist, title } = req.query;
      
      if (!artist && !title) {
        return res.json({ artwork: null });
      }

      // Build search query - prioritize artist + title combo
      const searchTerm = [artist, title].filter(Boolean).join(" ");
      const encodedSearch = encodeURIComponent(searchTerm);
      
      const response = await fetch(
        `https://itunes.apple.com/search?term=${encodedSearch}&media=music&limit=1`
      );
      
      if (!response.ok) {
        return res.json({ artwork: null });
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Get larger artwork (replace 100x100 with 600x600)
        const artwork = data.results[0].artworkUrl100?.replace("100x100", "600x600") || null;
        const artistName = data.results[0].artistName || null;
        const trackName = data.results[0].trackName || null;
        const albumName = data.results[0].collectionName || null;
        
        return res.json({ 
          artwork, 
          artistName, 
          trackName,
          albumName 
        });
      }

      res.json({ artwork: null });
    } catch (err) {
      console.error("Artwork fetch error:", err);
      res.json({ artwork: null });
    }
  });

  // Endpoint to fetch ICY metadata from stream
  app.get("/api/stations/:id/metadata", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const station = await storage.getStation(id);
      
      if (!station) {
        return res.status(404).json({ message: "Station not found" });
      }

      // Skip HLS streams - they don't have ICY metadata
      if (station.url.includes(".m3u8")) {
        return res.json({ title: null, artist: null });
      }

      // Fetch with ICY metadata header
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch(station.url, {
          method: "GET",
          headers: {
            "Icy-MetaData": "1",
            "User-Agent": "Mozilla/5.0",
          },
          signal: controller.signal,
        });

        clearTimeout(timeout);

        const icyMetaInt = response.headers.get("icy-metaint");
        
        if (!icyMetaInt) {
          // No ICY metadata supported
          return res.json({ title: null, artist: null });
        }

        const metaInt = parseInt(icyMetaInt);
        const reader = response.body?.getReader();
        
        if (!reader) {
          return res.json({ title: null, artist: null });
        }

        let bytesRead = 0;
        let metadataFound = false;
        let result = { title: null as string | null, artist: null as string | null };

        while (!metadataFound && bytesRead < metaInt + 4096) {
          const { value, done } = await reader.read();
          if (done) break;
          
          bytesRead += value.length;
          
          if (bytesRead >= metaInt) {
            // We've passed the metadata point, try to extract
            const decoder = new TextDecoder();
            const text = decoder.decode(value);
            
            // ICY metadata format: StreamTitle='Artist - Title';
            const match = text.match(/StreamTitle='([^']*?)'/);
            if (match && match[1]) {
              const parts = match[1].split(" - ");
              if (parts.length >= 2) {
                result.artist = parts[0].trim();
                result.title = parts.slice(1).join(" - ").trim();
              } else {
                result.title = match[1].trim();
              }
              metadataFound = true;
            }
          }
        }

        reader.cancel();
        return res.json(result);

      } catch (fetchError: any) {
        clearTimeout(timeout);
        if (fetchError.name === "AbortError") {
          return res.json({ title: null, artist: null });
        }
        throw fetchError;
      }

    } catch (err) {
      console.error("Metadata fetch error:", err);
      res.json({ title: null, artist: null });
    }
  });

  return httpServer;
}
