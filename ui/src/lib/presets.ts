/**
 * Profile Presets / Templates
 *
 * Este arquivo define os presets (templates) disponíveis para criação de perfis.
 * Cada preset representa uma configuração pré-definida de fingerprint para um
 * tipo específico de dispositivo/navegador.
 *
 * NOTA: Os presets de MacBook M3/M4 atualmente reutilizam o mesmo fingerprint base
 * de "Mac moderno". Eles foram criados como aliases para facilitar refinamentos
 * futuros quando tivermos dumps de fingerprints reais de cada geração de chip.
 */

export interface ProfilePreset {
  /** Identificador único do preset */
  id: string;
  /** Nome exibido no UI (PT-BR) */
  displayName: string;
  /** Descrição curta do preset */
  description: string;
  /** Sistema operacional base */
  os: "windows" | "macos" | "linux";
  /** Navegador simulado */
  browser: "firefox" | "chrome";
  /** User Agent padrão para este preset */
  userAgent: string;
  /** Categoria para agrupamento no UI */
  category: "windows" | "macos" | "linux";
  /** Tags para facilitar busca/filtro */
  tags: string[];
}

/**
 * Fingerprint base para Macs modernos (M-series).
 * Este é o fingerprint compartilhado pelos presets M1/M2/M3/M4.
 * Será refinado com dados específicos de cada geração em versões futuras.
 */
const MAC_MODERN_BASE_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

/**
 * Lista de todos os presets disponíveis.
 */
export const PROFILE_PRESETS: ProfilePreset[] = [
  // === Windows Presets ===
  {
    id: "windows_chrome_moderno",
    displayName: "Windows – Chrome (Moderno)",
    description: "Perfil Windows moderno com Chrome",
    os: "windows",
    browser: "chrome",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    category: "windows",
    tags: ["windows", "chrome", "moderno"],
  },
  {
    id: "windows_firefox_moderno",
    displayName: "Windows – Firefox (Moderno)",
    description: "Perfil Windows moderno com Firefox",
    os: "windows",
    browser: "firefox",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    category: "windows",
    tags: ["windows", "firefox", "moderno"],
  },

  // === macOS Presets ===
  {
    id: "macos_chrome_moderno",
    displayName: "macOS – Chrome (Genérico)",
    description: "Perfil macOS moderno com Chrome",
    os: "macos",
    browser: "chrome",
    userAgent: MAC_MODERN_BASE_UA,
    category: "macos",
    tags: ["macos", "mac", "chrome", "moderno"],
  },
  /**
   * MacBook M3 Preset
   *
   * NOTA: Este preset atualmente usa o mesmo fingerprint base de "Mac moderno"
   * (macos_chrome_moderno). Ele existe como um identificador separado para:
   * 1. Facilitar a seleção específica de M3 no UI
   * 2. Permitir refinamento futuro com fingerprints reais de M3
   *
   * Quando tivermos dumps de fingerprint específicos de M3, atualizaremos
   * este preset sem quebrar perfis existentes que o utilizam.
   */
  {
    id: "macos_m3_chrome_moderno",
    displayName: "MacBook M3 – Chrome (Sonoma/Sequoia)",
    description: "Perfil Mac moderno otimizado para Apple M3",
    os: "macos",
    browser: "chrome",
    userAgent: MAC_MODERN_BASE_UA,
    category: "macos",
    tags: ["macos", "mac", "m3", "apple silicon", "chrome", "sonoma", "sequoia"],
  },
  /**
   * MacBook M4 Preset
   *
   * NOTA: Este preset atualmente usa o mesmo fingerprint base de "Mac moderno"
   * (macos_chrome_moderno). Ele existe como um identificador separado para:
   * 1. Facilitar a seleção específica de M4 no UI
   * 2. Permitir refinamento futuro com fingerprints reais de M4
   *
   * Quando tivermos dumps de fingerprint específicos de M4, atualizaremos
   * este preset sem quebrar perfis existentes que o utilizam.
   */
  {
    id: "macos_m4_chrome_moderno",
    displayName: "MacBook M4 – Chrome (Sonoma/Sequoia)",
    description: "Perfil Mac moderno otimizado para Apple M4",
    os: "macos",
    browser: "chrome",
    userAgent: MAC_MODERN_BASE_UA,
    category: "macos",
    tags: ["macos", "mac", "m4", "apple silicon", "chrome", "sonoma", "sequoia"],
  },
  {
    id: "macos_firefox_moderno",
    displayName: "macOS – Firefox (Moderno)",
    description: "Perfil macOS moderno com Firefox",
    os: "macos",
    browser: "firefox",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14.0; rv:125.0) Gecko/20100101 Firefox/125.0",
    category: "macos",
    tags: ["macos", "mac", "firefox", "moderno"],
  },

  // === Linux Presets ===
  {
    id: "linux_chrome_moderno",
    displayName: "Linux – Chrome (Moderno)",
    description: "Perfil Linux moderno com Chrome",
    os: "linux",
    browser: "chrome",
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    category: "linux",
    tags: ["linux", "chrome", "moderno"],
  },
  {
    id: "linux_firefox_moderno",
    displayName: "Linux – Firefox (Moderno)",
    description: "Perfil Linux moderno com Firefox",
    os: "linux",
    browser: "firefox",
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0",
    category: "linux",
    tags: ["linux", "firefox", "moderno"],
  },
];

/**
 * Retorna um preset pelo seu ID.
 */
export function getPresetById(id: string): ProfilePreset | undefined {
  return PROFILE_PRESETS.find((preset) => preset.id === id);
}

/**
 * Retorna todos os presets de uma categoria específica.
 */
export function getPresetsByCategory(
  category: "windows" | "macos" | "linux"
): ProfilePreset[] {
  return PROFILE_PRESETS.filter((preset) => preset.category === category);
}

/**
 * Retorna todos os presets de Mac M-series (M1, M2, M3, M4).
 */
export function getMacMSeriesPresets(): ProfilePreset[] {
  return PROFILE_PRESETS.filter((preset) =>
    preset.tags.includes("apple silicon")
  );
}
