# VTuber Song List Website

## Overview

A production-ready web application for managing and displaying a VTuber's song list. The public homepage shows a read-only song list with advanced filtering capabilities (language, pinyin initials, search, captain-only requests). All visual customization and content management happens through dedicated admin pages. The design follows a custom "Soft Pastel VTuber UI" aesthetic with glass-like translucent panels and rounded corners.

## Recent Changes (December 25, 2025)

### 🆕 Card Image Upload & Icon Selection (Latest)
- **Card Image Upload**: Upload/URL input for card images with preview
  - Supports JPG, PNG, WebP formats (max 5MB)
  - Images display at 320x180px with object-fit: cover
  - Real-time preview in config panel
  - Stored in `/uploads/` directory

- **Link Icon Selection**: 13+ icon options for card links
  - Social media: Twitter, YouTube, Bilibili, Facebook, Instagram, LinkedIn
  - Utilities: Globe, GitHub, Mail, Phone, MapPin, Link, Share
  - Dropdown selector in link editor
  - Icons render in CardLinkItem component

### Earlier Updates
- **Hero Hotspot Trigger System**
  - Precise hover trigger area: only avatar/title triggers card reveal
  - Configurable hotspot settings: target, showHint, hintText, debounceMs

- **Smooth Two-Stage Animation**
  - Two-stage state: expanded (controls animation), shouldRender (controls DOM)
  - Debounced exit prevents flicker when moving between hotspot and cards

- **Click Entire Row to Copy**
  - Click anywhere on song table row triggers copy
  - Format: "点歌 {songName}" with configurable template

- **Auto Pinyin Initial Generation**
  - Mandarin songs auto-generate pinyinInitial (A-Z) from first character
  - Uses pinyin-pro library for conversion

- **Filter Hint Text**
  - Configurable hint text above search bar
  - Customizable alignment, font size, and color

- **Full MVP Implementation**
  - Homepage with hero banner, hover-reveal cards, and song table
  - Config page (/config) with five-tab layout and live preview
  - Song admin page (/yu) with full CRUD operations
  - JSON file persistence for config and songs data
  - Password-protected admin pages (default: vtuber123)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state, React Context for config state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom VTuber pastel theme variables defined in CSS

### Page Structure
- `/` - Public homepage with song list, filters, hero banner, and hover-reveal cards
- `/config` - Admin page for all UI/visual customization (password protected)
- `/yu` - Admin page for song data management (password protected)

### Backend Architecture
- **Runtime**: Node.js with Express
- **API Design**: RESTful endpoints under `/api/*`
- **Key Routes**:
  - `GET/PUT /api/config` - Site configuration management
  - `GET/PUT /api/songs` - Song list CRUD operations
  - `POST /api/upload` - Image upload handling via Multer

### Data Storage
- **Configuration**: JSON file storage at `data/site-config.json`
- **Songs**: JSON file storage at `data/songs.json`
- **Uploads**: Stored in `client/public/uploads/`
- **Database Ready**: Drizzle ORM configured with PostgreSQL schema in `shared/schema.ts` for future migration

### Shared Code
- Schema definitions using Zod for runtime validation
- Type definitions shared between client and server via `@shared/*` path alias
- Default configurations and seed data exported from schema

### Build System
- Development: Vite dev server with HMR, proxied through Express
- Production: Vite builds to `dist/public`, esbuild bundles server to `dist/index.cjs`
- Build script handles both client and server compilation

## External Dependencies

### Database
- PostgreSQL via Drizzle ORM (configured but data currently persisted in JSON files)
- Connection requires `DATABASE_URL` environment variable

### UI Framework
- Radix UI primitives for accessible component foundations
- shadcn/ui for pre-styled components (new-york style variant)
- Lucide React and react-icons for iconography

### File Handling
- Multer for multipart form data and image uploads
- 5MB file size limit, restricted to image MIME types

### Session Management
- connect-pg-simple configured for PostgreSQL session storage
- express-session for session handling

### Development Tools
- Replit-specific Vite plugins for development environment integration
- TypeScript with strict mode enabled