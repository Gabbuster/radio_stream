# Cyber Radio Stream

## Overview

A cyberpunk-themed internet radio streaming application that allows users to browse and listen to radio stations from around the world. The app features a neon-styled UI with smooth animations, HLS streaming support, and a PostgreSQL-backed station database.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with custom cyberpunk theme (neon colors, Orbitron/Rajdhani fonts)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Animations**: Framer Motion for page transitions and card animations
- **Audio Streaming**: hls.js for HLS (.m3u8) stream support, native HTML5 audio for MP3 streams
- **Build Tool**: Vite

### Backend Architecture
- **Framework**: Express 5 (ESM modules)
- **Runtime**: Node.js with tsx for TypeScript execution
- **API Pattern**: REST endpoints defined in shared/routes.ts with Zod validation
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: shared/schema.ts (shared between client and server)

### Data Flow
1. Frontend fetches stations via `/api/stations` endpoint
2. Stations are grouped by country and displayed as interactive cards
3. Clicking a station navigates to `/station/:id` for full-screen player
4. Audio playback uses HLS.js for m3u8 streams or direct HTML5 audio for MP3

### Key Design Patterns
- **Shared Types**: Schema and route definitions in `/shared` folder used by both client and server
- **Type-Safe API**: Zod schemas validate both request inputs and response shapes
- **Component Library**: shadcn/ui provides consistent, accessible UI components
- **Database Seeding**: Server auto-seeds stations on first run if database is empty

### File Structure
- `/client` - React frontend application
- `/server` - Express backend with API routes
- `/shared` - Shared TypeScript types, schemas, and route definitions
- `/migrations` - Drizzle database migrations

## External Dependencies

### Database
- **PostgreSQL**: Primary data store for radio stations
- **Drizzle ORM**: Database queries and schema management
- **connect-pg-simple**: Session storage (available but not currently used for auth)

### Audio Streaming
- **hls.js**: Client-side HLS stream decoding for .m3u8 format streams
- External radio stream URLs from various providers (RTL, iHeartRadio, etc.)

### UI/Styling
- **Google Fonts**: Orbitron (display) and Rajdhani (body) font families
- **Radix UI**: Accessible primitive components
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Frontend bundler with HMR
- **esbuild**: Production server bundling
- **Replit plugins**: Development banner and cartographer for Replit environment