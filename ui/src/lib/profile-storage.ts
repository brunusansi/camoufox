/**
 * Profile Storage Service
 *
 * Server-side utilities for reading and writing profile JSON files.
 * This module is only used in API routes (server-side).
 *
 * SEGURANÇA: Esta API é destinada APENAS para uso local.
 * NÃO exponha para a internet.
 */

import fs from "fs/promises";
import path from "path";
import { ProfileConfig, PROFILE_SCHEMA_VERSION, VALIDATION, sanitizeString, validateDPR, validateScreenDim, generateUUID } from "./profile-types";

/**
 * Get the profiles directory path.
 * Defaults to `profiles/` in the repository root.
 * 
 * Can be overridden via CAMOUFOX_PROFILES_DIR environment variable.
 */
export function getProfilesDir(): string {
  // Allow override via environment variable
  if (process.env.CAMOUFOX_PROFILES_DIR) {
    return process.env.CAMOUFOX_PROFILES_DIR;
  }
  // The UI is in ui/, so we go up one level to get repo root
  const repoRoot = path.resolve(process.cwd(), "..");
  return path.join(repoRoot, "profiles");
}

/**
 * Ensure the profiles directory exists.
 */
export async function ensureProfilesDir(): Promise<void> {
  const dir = getProfilesDir();
  await fs.mkdir(dir, { recursive: true });
}

/**
 * Get the file path for a profile.
 */
function getProfilePath(profileId: string): string {
  // Basic validation to prevent path traversal
  if (!profileId || profileId.includes("..") || profileId.includes("/") || profileId.includes("\\")) {
    throw new Error("ID de perfil inválido");
  }
  return path.join(getProfilesDir(), `${profileId}.json`);
}

/**
 * List all profiles from disk.
 */
export async function listProfiles(): Promise<ProfileConfig[]> {
  await ensureProfilesDir();
  const dir = getProfilesDir();

  try {
    const files = await fs.readdir(dir);
    const profiles: ProfileConfig[] = [];

    for (const file of files) {
      // Only process JSON files, skip README.md and other files
      if (!file.endsWith(".json")) continue;

      try {
        const filePath = path.join(dir, file);
        const content = await fs.readFile(filePath, "utf-8");
        const profile = JSON.parse(content) as ProfileConfig;
        profiles.push(profile);
      } catch {
        // Skip invalid profile files
        console.warn(`Ignorando arquivo de perfil inválido: ${file}`);
      }
    }

    // Sort by updated_at descending (most recent first)
    profiles.sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at).getTime();
      const dateB = new Date(b.updated_at || b.created_at).getTime();
      return dateB - dateA;
    });

    return profiles;
  } catch (error) {
    console.error("Erro ao listar perfis:", error);
    return [];
  }
}

/**
 * Load a single profile by ID.
 */
export async function loadProfile(profileId: string): Promise<ProfileConfig | null> {
  try {
    const filePath = getProfilePath(profileId);
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content) as ProfileConfig;
  } catch {
    return null;
  }
}

/**
 * Check if a profile exists.
 */
export async function profileExists(profileId: string): Promise<boolean> {
  try {
    const filePath = getProfilePath(profileId);
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize and validate a profile before saving.
 */
export function sanitizeProfile(input: Partial<ProfileConfig>): ProfileConfig {
  const now = new Date().toISOString();

  // Generate ID if not provided
  const id = input.id || generateUUID();

  // Sanitize strings
  const name = sanitizeString(input.name || "Perfil sem nome", VALIDATION.MAX_PROFILE_NAME_LENGTH);
  const notes = sanitizeString(input.notes || "", VALIDATION.MAX_NOTES_LENGTH);

  // Validate target_os
  const validOS = ["macos", "windows", "linux"];
  const target_os = validOS.includes(input.target_os || "") 
    ? (input.target_os as "macos" | "windows" | "linux") 
    : "windows";

  // Navigator config
  const navigator = {
    user_agent: sanitizeString(input.navigator?.user_agent || ""),
    platform: sanitizeString(input.navigator?.platform || ""),
    oscpu: sanitizeString(input.navigator?.oscpu || ""),
    hardware_concurrency: Math.max(1, Math.min(input.navigator?.hardware_concurrency || 8, 128)),
    max_touch_points: Math.max(0, Math.min(input.navigator?.max_touch_points || 0, 20)),
    languages: Array.isArray(input.navigator?.languages) 
      ? input.navigator.languages.slice(0, 10).map(l => sanitizeString(l, 20))
      : ["en-US", "en"],
  };

  // Screen config
  const screen = {
    width: validateScreenDim(input.screen?.width || 1920),
    height: validateScreenDim(input.screen?.height || 1080),
    avail_width: validateScreenDim(input.screen?.avail_width || input.screen?.width || 1920),
    avail_height: validateScreenDim(input.screen?.avail_height || (input.screen?.height || 1080) - 40),
    device_pixel_ratio: validateDPR(input.screen?.device_pixel_ratio || 1.0),
    color_depth: [8, 16, 24, 30, 32].includes(input.screen?.color_depth || 24) 
      ? input.screen?.color_depth || 24 
      : 24,
  };

  // Locale config
  const locale = {
    language: sanitizeString(input.locale?.language || "en", 10),
    region: sanitizeString(input.locale?.region || "US", 10),
    timezone: sanitizeString(input.locale?.timezone || "America/New_York", 100),
  };

  // WebGL config
  const webgl = {
    enabled: input.webgl?.enabled !== false,
    vendor: sanitizeString(input.webgl?.vendor || ""),
    renderer: sanitizeString(input.webgl?.renderer || ""),
  };

  // Proxy config
  const validProxyTypes = ["none", "http", "socks5"];
  const proxy = {
    type: validProxyTypes.includes(input.proxy?.type || "") 
      ? (input.proxy?.type as "none" | "http" | "socks5")
      : "none",
    server: sanitizeString(input.proxy?.server || "", 500),
    username: input.proxy?.username ? sanitizeString(input.proxy.username, 200) : null,
    password: input.proxy?.password ? sanitizeString(input.proxy.password, 200) : null,
  };

  // WebRTC config
  const validWebRTCModes = ["disabled", "proxy_only", "default"];
  const webrtc = {
    mode: validWebRTCModes.includes(input.webrtc?.mode || "") 
      ? (input.webrtc?.mode as "disabled" | "proxy_only" | "default")
      : "default",
    spoof_ipv4: input.webrtc?.spoof_ipv4 ? sanitizeString(input.webrtc.spoof_ipv4, 50) : null,
    spoof_ipv6: input.webrtc?.spoof_ipv6 ? sanitizeString(input.webrtc.spoof_ipv6, 100) : null,
  };

  // Storage config
  const storage = {
    user_data_dir: input.storage?.user_data_dir 
      ? sanitizeString(input.storage.user_data_dir, 500) 
      : null,
    persistent_cookies: input.storage?.persistent_cookies !== false,
  };

  return {
    id,
    name,
    notes,
    version: PROFILE_SCHEMA_VERSION,
    created_at: input.created_at || now,
    updated_at: now,
    target_os,
    browser_family: "firefox",
    navigator,
    screen,
    locale,
    webgl,
    proxy,
    webrtc,
    storage,
    startup_url: input.startup_url ? sanitizeString(input.startup_url, 2000) : undefined,
    startup_script: input.startup_script ? sanitizeString(input.startup_script, 10000) : undefined,
    custom_config: input.custom_config || undefined,
  };
}

/**
 * Save a profile to disk.
 */
export async function saveProfile(input: Partial<ProfileConfig>): Promise<ProfileConfig> {
  await ensureProfilesDir();

  // Check profile limit
  const existing = await listProfiles();
  if (existing.length >= VALIDATION.MAX_PROFILES && !input.id) {
    throw new Error(`Limite de ${VALIDATION.MAX_PROFILES} perfis atingido`);
  }

  const profile = sanitizeProfile(input);
  const filePath = getProfilePath(profile.id);

  await fs.writeFile(filePath, JSON.stringify(profile, null, 2), "utf-8");

  return profile;
}

/**
 * Delete a profile from disk.
 */
export async function deleteProfile(profileId: string): Promise<boolean> {
  try {
    const filePath = getProfilePath(profileId);
    await fs.unlink(filePath);
    return true;
  } catch {
    return false;
  }
}
