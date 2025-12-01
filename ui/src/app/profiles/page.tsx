"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout";
import { Button, Card, CardContent } from "@/components/ui";
import type { ProfileConfig } from "@/lib/profile-types";

/**
 * Display constants for the profiles list.
 */
const DISPLAY = {
  /** Maximum length for proxy server display */
  PROXY_SERVER_MAX_LENGTH: 30,
  /** Maximum length for user agent display in table */
  USER_AGENT_MAX_LENGTH: 60,
} as const;

/**
 * Profile list item with simplified display fields.
 */
interface ProfileListItem {
  id: string;
  name: string;
  userAgent: string;
  proxy: string;
  targetOS: string;
  createdAt: string;
}

/**
 * Convert ProfileConfig to simplified list item.
 */
function toListItem(profile: ProfileConfig): ProfileListItem {
  // Format proxy display
  let proxyDisplay = "Nenhum";
  if (profile.proxy?.type && profile.proxy.type !== "none") {
    proxyDisplay = profile.proxy.server
      ? `${profile.proxy.type.toUpperCase()}: ${profile.proxy.server.substring(0, DISPLAY.PROXY_SERVER_MAX_LENGTH)}...`
      : profile.proxy.type.toUpperCase();
  }

  // Format date
  const date = new Date(profile.created_at);
  const formattedDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return {
    id: profile.id,
    name: profile.name || "Sem nome",
    userAgent: profile.navigator?.user_agent || "-",
    proxy: proxyDisplay,
    targetOS: profile.target_os || "windows",
    createdAt: formattedDate,
  };
}

/**
 * Get OS icon/emoji.
 */
function getOSIcon(os: string): string {
  switch (os) {
    case "macos":
      return "🍎";
    case "linux":
      return "🐧";
    case "windows":
    default:
      return "🪟";
  }
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<ProfileListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningProfiles, setRunningProfiles] = useState<Set<string>>(new Set());

  /**
   * Fetch profiles from API.
   */
  const fetchProfiles = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/profiles");
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao carregar perfis");
      }

      const items = (data.profiles as ProfileConfig[]).map(toListItem);
      setProfiles(items);
    } catch (e) {
      console.error("Erro ao carregar perfis:", e);
      setError(e instanceof Error ? e.message : "Erro ao carregar perfis");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load profiles on mount
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  /**
   * Handle profile deletion.
   */
  const handleDelete = async (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;

    if (!confirm(`Tem certeza que deseja deletar o perfil "${profile.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/profiles/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao deletar perfil");
      }

      // Remove from local state
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      alert("Perfil deletado com sucesso!");
    } catch (e) {
      console.error("Erro ao deletar perfil:", e);
      alert(e instanceof Error ? e.message : "Erro ao deletar perfil");
    }
  };

  /**
   * Handle launching a profile.
   */
  const handleRun = async (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (!profile) return;

    // Prevent multiple clicks
    if (runningProfiles.has(id)) return;

    setRunningProfiles((prev) => new Set(prev).add(id));

    try {
      const response = await fetch(`/api/profiles/${id}/run`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Erro ao iniciar Camoufox");
      }

      alert(`Camoufox iniciado com perfil "${profile.name}"!`);
    } catch (e) {
      console.error("Erro ao iniciar Camoufox:", e);
      alert(e instanceof Error ? e.message : "Erro ao iniciar Camoufox");
    } finally {
      // Remove from running state after a short delay
      setTimeout(() => {
        setRunningProfiles((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 2000);
    }
  };

  return (
    <Shell title="Perfis">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Perfis</h2>
            <p className="text-foreground-muted mt-1">
              Gerencie seus perfis de navegador anti-detect.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={fetchProfiles} disabled={isLoading}>
              <svg
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </Button>
            <Link href="/profiles/new">
              <Button variant="primary">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Novo perfil
              </Button>
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2">
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
              <span className="text-sm text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && profiles.length === 0 && (
          <Card>
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-center">
                <svg
                  className="w-8 h-8 text-foreground-muted animate-spin mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm text-foreground-muted">
                  Carregando perfis...
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profiles List */}
        {!isLoading && (
          <Card>
            <CardContent className="p-0">
              {profiles.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-4">
                          Nome
                        </th>
                        <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-4">
                          User Agent
                        </th>
                        <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-4">
                          Proxy
                        </th>
                        <th className="text-left text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-4">
                          Criado em
                        </th>
                        <th className="text-right text-xs font-medium text-foreground-muted uppercase tracking-wider px-6 py-4">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {profiles.map((profile) => (
                        <tr
                          key={profile.id}
                          className="hover:bg-background-tertiary transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                <span className="text-sm">
                                  {getOSIcon(profile.targetOS)}
                                </span>
                              </div>
                              <span className="text-sm font-medium text-foreground">
                                {profile.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className="text-sm text-foreground-muted font-mono truncate block max-w-xs"
                              title={profile.userAgent}
                            >
                              {profile.userAgent.length > DISPLAY.USER_AGENT_MAX_LENGTH
                                ? `${profile.userAgent.substring(0, DISPLAY.USER_AGENT_MAX_LENGTH)}...`
                                : profile.userAgent}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-foreground-muted">
                              {profile.proxy}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-foreground-muted">
                              {profile.createdAt}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRun(profile.id)}
                                disabled={runningProfiles.has(profile.id)}
                                className="text-success hover:text-success hover:bg-success/10"
                              >
                                {runningProfiles.has(profile.id) ? (
                                  <svg
                                    className="w-4 h-4 animate-spin"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    />
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                )}
                                <span className="ml-2">
                                  {runningProfiles.has(profile.id)
                                    ? "Iniciando..."
                                    : "Iniciar"}
                                </span>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(profile.id)}
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                <span className="ml-2">Deletar</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <div className="w-16 h-16 rounded-2xl bg-background-tertiary flex items-center justify-center mb-4">
                    <svg
                      className="w-8 h-8 text-foreground-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Nenhum perfil encontrado
                  </h3>
                  <p className="text-sm text-foreground-muted text-center mb-6 max-w-sm">
                    Você ainda não criou nenhum perfil. Crie seu primeiro perfil
                    para começar a usar o Camoufox.
                  </p>
                  <Link href="/profiles/new">
                    <Button variant="primary">
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Criar primeiro perfil
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Shell>
  );
}
