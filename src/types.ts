export interface StreamCrop {
  x: number; // percentage X offset (0 to 100)
  y: number; // percentage Y offset (0 to 100)
  width: number; // percentage Width (10 to 100)
  height: number; // percentage Height (10 to 100)
  zoom: number; // scale multiplier e.g. 1.0 to 3.0
}

export type SituationType = 'live' | 'half_time' | 'pre_match' | 'staff_error' | 'pub_discord' | 'custom';

export interface CustomOverlayConfig {
  title: string;
  subtitle: string;
  badgeText: string;
  badgeColor: string; // hex color e.g. #00FF87
  icon: 'alert' | 'trophy' | 'pause' | 'football' | 'message' | 'shield';
  backgroundImageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export interface Stream {
  id: string;
  title: string;
  league: string; // "Ligue 1", "Champions League", "Europa League", "Premier League", "Serie A", "La Liga"
  kickoffTime: string; // ISO string e.g. "2026-10-20T21:00:00"
  coverUrl: string;
  isFeatured?: boolean;
  status: 'live' | 'upcoming' | 'ended';
  sourceType: 'web_crop' | 'screen_share' | 'video_url';
  sourceUrl?: string;
  crop?: StreamCrop;
  currentSituation: SituationType;
  customOverlay?: CustomOverlayConfig;
  viewers: number;
  homeTeam: string;
  awayTeam: string;
  score?: string;
  minute?: string;
  description?: string;
}

export interface ChatMessage {
  id: string;
  streamId: string;
  sender: string;
  text: string;
  timestamp: string;
  isAdmin?: boolean;
  avatarColor?: string;
}

export interface FeaturedHeroConfig {
  title: string;
  subtitle: string;
  badgeText: string;
  coverUrl: string;
  buttonText: string;
  buttonLink?: string;
  streamId?: string;
}
