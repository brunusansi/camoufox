"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/layout";
import { Button, Card, CardContent, Stepper } from "@/components/ui";
import {
  PROFILE_PRESETS,
  getPresetById,
  isMacMSeriesTemplate
} from "@/lib/presets";

const steps = [
  { label: "Template" },
  { label: "Básico" },
  { label: "Fingerprint" },
  { label: "Rede" },
  { label: "Storage" },
  { label: "Resumo" }
];

// Profile templates based on presets (card grid do passo 0)
const PROFILE_TEMPLATES = [
  {
    id: "macos_apple_silicon",
    name: "MacBook M1 (Retina)",
    description: "MacBook with Apple M1 chip and Retina display",
    icon: "🍎",
    os: "macos",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0",
    platform: "MacIntel",
    oscpu: "Intel Mac OS X 10.15",
    screenWidth: 1920,
    screenHeight: 1080,
    devicePixelRatio: 2.0,
    webglVendor: "Apple Inc.",
    webglRenderer: "Apple M1",
    timezone: "America/Los_Angeles",
    locale: "en-US"
  },
  {
    id: "macos_standard",
    name: "MacBook (Standard)",
    description: "MacBook with standard (non-Retina) display",
    icon: "🍎",
    os: "macos",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0",
    platform: "MacIntel",
    oscpu: "Intel Mac OS X 10.15",
    screenWidth: 1440,
    screenHeight: 900,
    devicePixelRatio: 1.0,
    webglVendor: "Apple Inc.",
    webglRenderer: "Apple M1",
    timezone: "America/Los_Angeles",
    locale: "en-US"
  },
  {
    id: "windows_11_nvidia",
    name: "Windows 11 (NVIDIA)",
    description: "Windows 11 desktop with NVIDIA GPU",
    icon: "🪟",
    os: "windows",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
    platform: "Win32",
    oscpu: "Windows NT 10.0; Win64; x64",
    screenWidth: 1920,
    screenHeight: 1080,
    devicePixelRatio: 1.0,
    webglVendor: "Google Inc. (NVIDIA)",
    webglRenderer:
      "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)",
    timezone: "America/New_York",
    locale: "en-US"
  },
  {
    id: "windows_11_intel",
    name: "Windows 11 (Intel)",
    description: "Windows 11 laptop with Intel integrated GPU",
    icon: "🪟",
    os: "windows",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
    platform: "Win32",
    oscpu: "Windows NT 10.0; Win64; x64",
    screenWidth: 1920,
    screenHeight: 1080,
    devicePixelRatio: 1.25,
    webglVendor: "Google Inc. (Intel)",
    webglRenderer:
      "ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)",
    timezone: "America/New_York",
    locale: "en-US"
  },
  {
    id: "linux_desktop",
    name: "Linux Desktop",
    description: "Ubuntu-like Linux desktop with Intel GPU",
    icon: "🐧",
    os: "linux",
    userAgent:
      "Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0",
    platform: "Linux x86_64",
    oscpu: "Linux x86_64",
    screenWidth: 1920,
    screenHeight: 1080,
    devicePixelRatio: 1.0,
    webglVendor: "Mesa",
    webglRenderer: "Mesa Intel(R) UHD Graphics 620 (KBL GT2)",
    timezone: "America/New_York",
    locale: "en-US"
  },
  {
    id: "custom",
    name: "Custom Profile",
    description: "Start from scratch with custom settings",
    icon: "⚙️",
    os: "windows",
    userAgent: "",
    platform: "",
    oscpu: "",
    screenWidth: 1920,
    screenHeight: 1080,
    devicePixelRatio: 1.0,
    webglVendor: "",
    webglRenderer: "",
    timezone: "America/New_York",
    locale: "en-US"
  }
];

// Consistency check types
interface ConsistencyIssue {
  level: "error" | "warning" | "info";
  message: string;
  field: string;
  suggestion: string;
}

interface FormData {
  templateId: string;
  name: string;
  notes: string;
  template: string; // id de preset (PROFILE_PRESETS)
  userAgent: string;
  os: string;
  platform: string;
  oscpu: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  webglVendor: string;
  webglRenderer: string;
  timezone: string;
  locale: string;
  proxyType: string;
  proxyAddress: string;
  webrtcMode: string;
  storagePath: string;
}

// Consistency validation functions (client-side)
function validateConsistency(data: FormData): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];

  // OS/Platform check
  const osPatterns: Record<string, string[]> = {
    macos: ["MacIntel", "MacPPC"],
    windows: ["Win32", "Win64"],
    linux: ["Linux"]
  };

  if (data.platform && osPatterns[data.os]) {
    const matches = osPatterns[data.os].some((p) =>
      data.platform.includes(p)
    );
    if (!matches) {
      issues.push({
        level: "error",
        message: `Platform "${data.platform}" does not match OS "${data.os}"`,
        field: "platform",
        suggestion: `Use one of: ${osPatterns[data.os].join(", ")}`
      });
    }
  }

  // OS/User-Agent check
  const uaPatterns: Record<string, string[]> = {
    macos: ["Macintosh", "Mac OS X"],
    windows: ["Windows NT"],
    linux: ["Linux", "X11"]
  };

  if (data.userAgent && uaPatterns[data.os]) {
    const matches = uaPatterns[data.os].some((p) =>
      data.userAgent.includes(p)
    );
    if (!matches) {
      issues.push({
        level: "error",
        message: `User-Agent does not contain expected patterns for "${data.os}"`,
        field: "userAgent",
        suggestion: `User-Agent should contain one of: ${uaPatterns[
          data.os
        ].join(", ")}`
      });
    }
  }

  // WebGL/OS check
  if (data.webglRenderer) {
    if (
      data.os === "macos" &&
      (data.webglRenderer.toLowerCase().includes("direct3d") ||
        data.webglRenderer.toLowerCase().includes("angle"))
    ) {
      issues.push({
        level: "error",
        message: "Direct3D/ANGLE renderer detected with macOS target",
        field: "webglRenderer",
        suggestion: "macOS typically uses Apple GPU or OpenGL renderers"
      });
    }
    if (
      data.os === "windows" &&
      data.webglRenderer.toLowerCase().includes("apple m")
    ) {
      issues.push({
        level: "error",
        message: "Apple renderer detected with Windows target",
        field: "webglRenderer",
        suggestion:
          "Windows typically uses ANGLE (Direct3D) or native GPU renderers"
      });
    }
  }

  // Device pixel ratio check for macOS
  if (
    data.os === "macos" &&
    data.devicePixelRatio !== 1.0 &&
    data.devicePixelRatio !== 2.0
  ) {
    issues.push({
      level: "warning",
      message: `Device pixel ratio ${data.devicePixelRatio} is unusual for macOS`,
      field: "devicePixelRatio",
      suggestion: "macOS typically uses 1.0 (standard) or 2.0 (Retina)"
    });
  }

  // WebRTC/Proxy check
  if (
    data.proxyType !== "none" &&
    data.proxyAddress &&
    data.webrtcMode === "default"
  ) {
    issues.push({
      level: "warning",
      message: "WebRTC is enabled with proxy but mode is 'default'",
      field: "webrtcMode",
      suggestion:
        "Consider setting webrtc mode to 'disabled' or 'proxy_only' to prevent IP leaks"
    });
  }

  return issues;
}

export default function NewProfilePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    templateId: "",
    name: "",
    notes: "",
    template: "",
    userAgent: "",
    os: "windows",
    platform: "",
    oscpu: "",
    screenWidth: 1920,
    screenHeight: 1080,
    devicePixelRatio: 1.0,
    webglVendor: "",
    webglRenderer: "",
    timezone: "America/New_York",
    locale: "en-US",
    proxyType: "none",
    proxyAddress: "",
    webrtcMode: "default",
    storagePath: ""
  });
  const [consistencyIssues, setConsistencyIssues] = useState<ConsistencyIssue[]>([]);

  // Update consistency issues when form data changes
  useEffect(() => {
    setConsistencyIssues(validateConsistency(formData));
  }, [formData]);

  const updateFormData = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Seleção por preset (dropdown do passo Básico)
  const handleTemplateSelect = (templateId: string) => {
    const preset = getPresetById(templateId);
    if (preset) {
      setFormData((prev) => ({
        ...prev,
        template: templateId,
        os: preset.os,
        userAgent: preset.userAgent
      }));
    } else {
      // Reset template
      setFormData((prev) => ({
        ...prev,
        template: ""
      }));
    }
  };

  // Seleção por card (PROFILE_TEMPLATES) no passo 0
  const applyTemplate = (templateId: string) => {
    const template = PROFILE_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        templateId: template.id,
        os: template.os,
        userAgent: template.userAgent,
        platform: template.platform,
        oscpu: template.oscpu,
        screenWidth: template.screenWidth,
        screenHeight: template.screenHeight,
        devicePixelRatio: template.devicePixelRatio,
        webglVendor: template.webglVendor,
        webglRenderer: template.webglRenderer,
        timezone: template.timezone,
        locale: template.locale
      }));
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleCreate = async () => {
    const sanitize = (str: string): string => {
      if (!str) return str;
      return str.slice(0, 5000);
    };

    const generateId = (): string => {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    };

    const profile = {
      id: generateId(),
      name: sanitize(formData.name) || "Untitled Profile",
      notes: sanitize(formData.notes),
      version: "1.0.0",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      target_os: formData.os,
      browser_family: "firefox",
      navigator: {
        user_agent: sanitize(formData.userAgent),
        platform: sanitize(formData.platform),
        oscpu: sanitize(formData.oscpu),
        hardware_concurrency: 8,
        max_touch_points: 0,
        languages: [formData.locale, formData.locale.split("-")[0]]
      },
      screen: {
        width: Math.max(0, Math.min(formData.screenWidth, 10000)),
        height: Math.max(0, Math.min(formData.screenHeight, 10000)),
        avail_width: Math.max(0, Math.min(formData.screenWidth, 10000)),
        avail_height: Math.max(
          0,
          Math.min(formData.screenHeight - 40, 10000)
        ),
        device_pixel_ratio: Math.max(
          0.5,
          Math.min(formData.devicePixelRatio, 4)
        ),
        color_depth: 24
      },
      locale: {
        language: formData.locale.split("-")[0],
        region: formData.locale.split("-")[1] || "US",
        timezone: sanitize(formData.timezone)
      },
      webgl: {
        enabled: true,
        vendor: sanitize(formData.webglVendor),
        renderer: sanitize(formData.webglRenderer)
      },
      proxy: {
        type: formData.proxyType,
        server: sanitize(formData.proxyAddress)
      },
      webrtc: {
        mode: formData.webrtcMode
      },
      storage: {
        user_data_dir: formData.storagePath
          ? sanitize(formData.storagePath)
          : null
      }
    };

    console.log("Creating profile:", JSON.stringify(profile, null, 2));

    try {
      const existingProfiles = JSON.parse(
        localStorage.getItem("camoufox_profiles") || "[]"
      );

      if (existingProfiles.length >= 100) {
        alert(
          "Limite de perfis atingido. Delete alguns perfis antes de criar novos."
        );
        return;
      }

      existingProfiles.push(profile);
      localStorage.setItem(
        "camoufox_profiles",
        JSON.stringify(existingProfiles)
      );

      alert("Perfil criado com sucesso!");
      router.push("/profiles");
    } catch (e) {
      console.error("Failed to save profile:", e);
      alert(
        "Erro ao salvar perfil. Verifique o espaço de armazenamento."
      );
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <p className="text-sm text-foreground-muted">
              Escolha um modelo pré-configurado ou comece do zero. Os modelos
              são baseados em fingerprints reais capturados de dispositivos.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {PROFILE_TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  onClick={() => applyTemplate(template.id)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    formData.templateId === template.id
                      ? "border-accent bg-accent/10"
                      : "border-border hover:border-accent/50 bg-background-tertiary"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{template.icon}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground">
                        {template.name}
                      </h4>
                      <p className="text-xs text-foreground-muted mt-1">
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-background border border-border text-foreground-muted">
                          {template.os}
                        </span>
                        {template.devicePixelRatio > 1 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-accent/10 border border-accent/30 text-accent">
                            HiDPI
                          </span>
                        )}
                      </div>
                    </div>
                    {formData.templateId === template.id && (
                      <svg
                        className="w-5 h-5 text-accent"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6">
            {/* Template Selector (presets) */}
            <div>
              <label
                htmlFor="template"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Template / Modelo
              </label>
              <select
                id="template"
                value={formData.template}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              >
                <option value="">Selecione um template (opcional)</option>
                <optgroup label="macOS / Apple Silicon">
                  {PROFILE_PRESETS.filter(
                    (p) => p.category === "macos"
                  ).map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.displayName}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Windows">
                  {PROFILE_PRESETS.filter(
                    (p) => p.category === "windows"
                  ).map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.displayName}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Linux">
                  {PROFILE_PRESETS.filter(
                    (p) => p.category === "linux"
                  ).map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.displayName}
                    </option>
                  ))}
                </optgroup>
              </select>
              <p className="text-xs text-foreground-muted mt-2">
                Selecione um template para pré-configurar o perfil com valores
                otimizados.
              </p>
            </div>

            {/* Help text for Mac M-series templates */}
            {formData.template && isMacMSeriesTemplate(formData.template) && (
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <h4 className="text-sm font-medium text-accent mb-2">
                  ℹ️ Sobre os templates Mac M-series
                </h4>
                <p className="text-xs text-foreground-muted">
                  Estes templates são{" "}
                  <strong>perfis Mac modernos</strong> baseados em fingerprint
                  coerente (User Agent, WebGL, screen, etc.). Diferenças exatas
                  entre M3/M4 são principalmente de fingerprint fino, que será
                  refinado com dados reais em futuras versões.
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Nome do perfil
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="Ex: Perfil Principal"
                className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Notas internas
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => updateFormData("notes", e.target.value)}
                placeholder="Adicione notas sobre este perfil..."
                rows={4}
                className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            {/* info do template (preset) se selecionado */}
            {formData.template && (
              <div className="p-4 rounded-lg bg-background-tertiary border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <svg
                    className="w-4 h-4 text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-foreground">
                    Template: {getPresetById(formData.template)?.displayName}
                  </span>
                </div>
                <p className="text-xs text-foreground-muted">
                  Os valores abaixo foram pré-configurados pelo template
                  selecionado. Você pode ajustá-los manualmente se necessário.
                </p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="os"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Sistema Operacional
                </label>
                <select
                  id="os"
                  value={formData.os}
                  onChange={(e) => updateFormData("os", e.target.value)}
                  className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                >
                  <option value="windows">Windows</option>
                  <option value="macos">macOS</option>
                  <option value="linux">Linux</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="platform"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Platform
                </label>
                <input
                  type="text"
                  id="platform"
                  value={formData.platform}
                  onChange={(e) => updateFormData("platform", e.target.value)}
                  placeholder="Ex: MacIntel, Win32"
                  className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="userAgent"
                className="block text-sm font-medium text-foreground mb-2"
              >
                User Agent
              </label>
              <textarea
                id="userAgent"
                value={formData.userAgent}
                onChange={(e) => updateFormData("userAgent", e.target.value)}
                rows={2}
                className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="screenWidth"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Screen Width
                </label>
                <input
                  type="number"
                  id="screenWidth"
                  value={formData.screenWidth}
                  onChange={(e) =>
                    updateFormData(
                      "screenWidth",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="screenHeight"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Screen Height
                </label>
                <input
                  type="number"
                  id="screenHeight"
                  value={formData.screenHeight}
                  onChange={(e) =>
                    updateFormData(
                      "screenHeight",
                      parseInt(e.target.value) || 0
                    )
                  }
                  className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="devicePixelRatio"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Pixel Ratio
                </label>
                <input
                  type="number"
                  id="devicePixelRatio"
                  step="0.25"
                  value={formData.devicePixelRatio}
                  onChange={(e) =>
                    updateFormData(
                      "devicePixelRatio",
                      parseFloat(e.target.value) || 1.0
                    )
                  }
                  className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="webglRenderer"
                className="block text-sm font-medium text-foreground mb-2"
              >
                WebGL Renderer
              </label>
              <input
                type="text"
                id="webglRenderer"
                value={formData.webglRenderer}
                onChange={(e) =>
                  updateFormData("webglRenderer", e.target.value)
                }
                placeholder="Ex: Apple M1, NVIDIA GeForce RTX 3060"
                className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="proxyType"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Tipo de Proxy
                </label>
                <select
                  id="proxyType"
                  value={formData.proxyType}
                  onChange={(e) => updateFormData("proxyType", e.target.value)}
                  className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                >
                  <option value="none">Nenhum</option>
                  <option value="http">HTTP/HTTPS</option>
                  <option value="socks5">SOCKS5</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="webrtcMode"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  WebRTC Mode
                </label>
                <select
                  id="webrtcMode"
                  value={formData.webrtcMode}
                  onChange={(e) =>
                    updateFormData("webrtcMode", e.target.value)
                  }
                  className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                >
                  <option value="default">Default (enabled)</option>
                  <option value="proxy_only">Proxy Only</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
            </div>
            {formData.proxyType !== "none" && (
              <div>
                <label
                  htmlFor="proxyAddress"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Endereço do Proxy
                </label>
                <input
                  type="text"
                  id="proxyAddress"
                  value={formData.proxyAddress}
                  onChange={(e) =>
                    updateFormData("proxyAddress", e.target.value)
                  }
                  placeholder="Ex: user:pass@host:port"
                  className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                />
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="timezone"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Timezone
                </label>
                <input
                  type="text"
                  id="timezone"
                  value={formData.timezone}
                  onChange={(e) =>
                    updateFormData("timezone", e.target.value)
                  }
                  placeholder="Ex: America/New_York"
                  className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="locale"
                  className="block text-sm font-medium text-foreground mb-2"
                >
                  Locale
                </label>
                <input
                  type="text"
                  id="locale"
                  value={formData.locale}
                  onChange={(e) => updateFormData("locale", e.target.value)}
                  placeholder="Ex: en-US"
                  className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label
                htmlFor="storagePath"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Caminho de armazenamento (opcional)
              </label>
              <input
                type="text"
                id="storagePath"
                value={formData.storagePath}
                onChange={(e) =>
                  updateFormData("storagePath", e.target.value)
                }
                placeholder="Ex: /path/to/profile/folder"
                className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
              <p className="text-xs text-foreground-muted mt-2">
                Deixe vazio para usar o caminho padrão do sistema.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background-tertiary border border-border">
              <h4 className="text-sm font-medium text-foreground mb-2">
                Dados armazenados
              </h4>
              <ul className="text-xs text-foreground-muted space-y-1">
                <li>• Cookies e sessões</li>
                <li>• Local Storage e IndexedDB</li>
                <li>• Cache do navegador</li>
                <li>• Histórico de navegação</li>
              </ul>
            </div>
          </div>
        );
      case 5: {
        const errors = consistencyIssues.filter((i) => i.level === "error");
        const warnings = consistencyIssues.filter((i) => i.level === "warning");
        const isValid = errors.length === 0;

        return (
          <div className="space-y-6">
            <div
              className={`p-4 rounded-lg border ${
                isValid
                  ? "bg-success/10 border-success/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {isValid ? (
                  <svg
                    className="w-5 h-5 text-success"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <h4
                  className={`text-sm font-medium ${
                    isValid ? "text-success" : "text-red-400"
                  }`}
                >
                  {isValid
                    ? "Verificação de consistência passou!"
                    : `${errors.length} erro(s) encontrado(s)`}
                </h4>
              </div>
              {consistencyIssues.length > 0 && (
                <div className="space-y-2 mt-3">
                  {errors.map((issue, i) => (
                    <div
                      key={`error-${i}`}
                      className="flex items-start gap-2 text-xs"
                    >
                      <span className="text-red-400">❌</span>
                      <div>
                        <p className="text-red-300">{issue.message}</p>
                        <p className="text-foreground-muted">
                          {issue.suggestion}
                        </p>
                      </div>
                    </div>
                  ))}
                  {warnings.map((issue, i) => (
                    <div
                      key={`warn-${i}`}
                      className="flex items-start gap-2 text-xs"
                    >
                      <span className="text-yellow-400">⚠️</span>
                      <div>
                        <p className="text-yellow-300">{issue.message}</p>
                        <p className="text-foreground-muted">
                          {issue.suggestion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">
                Resumo do Perfil
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-foreground-muted">Nome</span>
                  <span className="text-sm text-foreground font-medium">
                    {formData.name || "Não definido"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-foreground-muted">
                    Template
                  </span>
                  <span className="text-sm text-foreground font-medium">
                    {PROFILE_TEMPLATES.find(
                      (t) => t.id === formData.templateId
                    )?.name || "Custom"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-foreground-muted">
                    Sistema Operacional
                  </span>
                  <span className="text-sm text-foreground font-medium capitalize">
                    {formData.os}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-foreground-muted">
                    Platform
                  </span>
                  <span className="text-sm text-foreground font-medium">
                    {formData.platform || "Auto"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-foreground-muted">
                    Screen
                  </span>
                  <span className="text-sm text-foreground font-medium">
                    {formData.screenWidth}x{formData.screenHeight}@
                    {formData.devicePixelRatio}x
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-foreground-muted">Proxy</span>
                  <span className="text-sm text-foreground font-medium">
                    {formData.proxyType === "none"
                      ? "Nenhum"
                      : formData.proxyAddress || "Configurado"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-foreground-muted">WebRTC</span>
                  <span className="text-sm text-foreground font-medium capitalize">
                    {formData.webrtcMode}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-border">
                  <span className="text-sm text-foreground-muted">
                    Timezone
                  </span>
                  <span className="text-sm text-foreground font-medium">
                    {formData.timezone}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <Shell title="Novo perfil">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Novo perfil</h2>
            <p className="text-foreground-muted mt-1">
              Configure um novo perfil de navegador anti-detect.
            </p>
          </div>
          <Link href="/profiles">
            <Button variant="ghost">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Voltar
            </Button>
          </Link>
        </div>

        <Stepper
          steps={steps}
          currentStep={currentStep}
          className="mb-8"
        />

        <Card>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">
                {steps[currentStep].label}
              </h3>
              <p className="text-sm text-foreground-muted mt-1">
                {currentStep === 0 &&
                  "Escolha um modelo pré-configurado para começar."}
                {currentStep === 1 &&
                  "Defina as informações básicas do perfil."}
                {currentStep === 2 &&
                  "Configure as propriedades de fingerprint."}
                {currentStep === 3 &&
                  "Configure as opções de rede e proxy."}
                {currentStep === 4 &&
                  "Configure o armazenamento de dados."}
                {currentStep === 5 &&
                  "Revise e confirme as configurações."}
              </p>
            </div>
            {renderStepContent()}
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Voltar
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button variant="primary" onClick={handleNext}>
              Continuar
              <svg
                className="w-4 h-4 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={consistencyIssues.some((i) => i.level === "error")}
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Criar perfil
            </Button>
          )}
        </div>
      </div>
    </Shell>
  );
}