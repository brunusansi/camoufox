/**
 * Shared Profile Types for Camoufox UI
 *
 * These types match the ProfileConfig model in the Python backend
 * (pythonlib/camoufox/profile.py). Keep them in sync!
 *
 * @module profile-types
 */

/**
 * Profile schema version - must match Python PROFILE_SCHEMA_VERSION
 */
export const PROFILE_SCHEMA_VERSION = "1.0.0";

/**
 * Proxy configuration for browser profiles.
 */
export interface ProxyConfig {
  type: "none" | "http" | "socks5";
  server: string;
  username?: string | null;
  password?: string | null;
}

/**
 * WebRTC configuration for browser profiles.
 */
export interface WebRTCConfig {
  mode: "disabled" | "proxy_only" | "default";
  spoof_ipv4?: string | null;
  spoof_ipv6?: string | null;
}

/**
 * Screen configuration for fingerprint spoofing.
 */
export interface ScreenConfig {
  width: number;
  height: number;
  avail_width: number;
  avail_height: number;
  device_pixel_ratio: number;
  color_depth: number;
}

/**
 * Navigator properties for fingerprint spoofing.
 */
export interface NavigatorConfig {
  user_agent: string;
  platform: string;
  oscpu: string;
  hardware_concurrency: number;
  max_touch_points: number;
  languages: string[];
}

/**
 * Locale and timezone configuration.
 */
export interface LocaleConfig {
  language: string;
  region: string;
  timezone: string;
}

/**
 * WebGL configuration for fingerprint spoofing.
 */
export interface WebGLConfig {
  enabled: boolean;
  vendor: string;
  renderer: string;
}

/**
 * Storage configuration for browser profiles.
 */
export interface StorageConfig {
  user_data_dir: string | null;
  persistent_cookies?: boolean;
}

/**
 * Main profile configuration model.
 *
 * This is the typed, versioned profile model that represents all configurable
 * aspects of a Camoufox browser profile. It must stay in sync with the Python
 * ProfileConfig dataclass.
 */
export interface ProfileConfig {
  // Metadata
  id: string;
  name: string;
  notes: string;
  version: string;
  created_at: string;
  updated_at: string;

  // Target configuration
  target_os: "macos" | "windows" | "linux";
  browser_family: "firefox";

  // Fingerprint components
  navigator: NavigatorConfig;
  screen: ScreenConfig;
  locale: LocaleConfig;
  webgl: WebGLConfig;

  // Network settings
  proxy: ProxyConfig;
  webrtc: WebRTCConfig;

  // Storage settings
  storage: StorageConfig;

  // Automation settings (optional)
  startup_url?: string;
  startup_script?: string;

  // Custom Camoufox config overrides (optional)
  custom_config?: Record<string, unknown>;
}

/**
 * Create request body - same as ProfileConfig but without ID and timestamps
 * (these will be generated server-side).
 */
export type ProfileCreateRequest = Omit<
  ProfileConfig,
  "id" | "created_at" | "updated_at" | "version"
>;

/**
 * Summary of a profile for list views.
 */
export interface ProfileSummary {
  id: string;
  name: string;
  target_os: string;
  created_at: string;
  updated_at: string;
  proxy_type: string;
  user_agent: string;
}

/**
 * API response types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ProfileListResponse {
  profiles: ProfileConfig[];
}

export interface ProfileRunResponse {
  success: boolean;
  message: string;
  pid?: number;
}

/**
 * Input validation constants
 */
export const VALIDATION = {
  MAX_STRING_LENGTH: 5000,
  MAX_PROFILE_NAME_LENGTH: 200,
  MAX_NOTES_LENGTH: 10000,
  MAX_PROFILES: 100,
  MIN_SCREEN_DIM: 100,
  MAX_SCREEN_DIM: 10000,
  MIN_DPR: 0.5,
  MAX_DPR: 4,
} as const;

/**
 * Sanitize string input for profile fields.
 */
export function sanitizeString(str: string, maxLength: number = VALIDATION.MAX_STRING_LENGTH): string {
  if (!str) return str;
  return str.slice(0, maxLength).trim();
}

/**
 * Validate screen dimension.
 */
export function validateScreenDim(value: number): number {
  return Math.max(VALIDATION.MIN_SCREEN_DIM, Math.min(value, VALIDATION.MAX_SCREEN_DIM));
}

/**
 * Validate device pixel ratio.
 */
export function validateDPR(value: number): number {
  return Math.max(VALIDATION.MIN_DPR, Math.min(value, VALIDATION.MAX_DPR));
}

/**
 * Generate a UUID v4.
 */
export function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older environments
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Create a default profile configuration.
 */
export function createDefaultProfile(partial?: Partial<ProfileConfig>): ProfileConfig {
  const now = new Date().toISOString();
  return {
    id: generateUUID(),
    name: "",
    notes: "",
    version: PROFILE_SCHEMA_VERSION,
    created_at: now,
    updated_at: now,
    target_os: "windows",
    browser_family: "firefox",
    navigator: {
      user_agent: "",
      platform: "",
      oscpu: "",
      hardware_concurrency: 8,
      max_touch_points: 0,
      languages: ["en-US", "en"],
    },
    screen: {
      width: 1920,
      height: 1080,
      avail_width: 1920,
      avail_height: 1040,
      device_pixel_ratio: 1.0,
      color_depth: 24,
    },
    locale: {
      language: "en",
      region: "US",
      timezone: "America/New_York",
    },
    webgl: {
      enabled: true,
      vendor: "",
      renderer: "",
    },
    proxy: {
      type: "none",
      server: "",
    },
    webrtc: {
      mode: "default",
    },
    storage: {
      user_data_dir: null,
    },
    ...partial,
  };
}
