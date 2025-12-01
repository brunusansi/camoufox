"use client";

import { useState } from "react";
import Link from "next/link";
import { Shell } from "@/components/layout";
import { Button, Card, CardContent } from "@/components/ui";

// Mock profile data for demonstration
const initialProfiles = [
  {
    id: "1",
    name: "Perfil Demo",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    proxy: "Nenhum",
    createdAt: "2024-01-15",
  },
];

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState(initialProfiles);

  const handleDelete = (id: string) => {
    const profile = profiles.find((p) => p.id === id);
    if (profile && confirm(`Tem certeza que deseja deletar o perfil "${profile.name}"?`)) {
      setProfiles((prev) => prev.filter((p) => p.id !== id));
      console.log(`Profile ${id} deleted`);
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
          <Link href="/profiles/new">
            <Button variant="primary">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo perfil
            </Button>
          </Link>
        </div>

        {/* Profiles List */}
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
                      <tr key={profile.id} className="hover:bg-background-tertiary transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                              <span className="text-accent text-sm font-medium">
                                {profile.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {profile.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-foreground-muted font-mono truncate block max-w-xs">
                            {profile.userAgent}
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
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="ml-2">Iniciar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(profile.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
                  <svg className="w-8 h-8 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Nenhum perfil encontrado
                </h3>
                <p className="text-sm text-foreground-muted text-center mb-6 max-w-sm">
                  Você ainda não criou nenhum perfil. Crie seu primeiro perfil para começar a usar o Camoufox.
                </p>
                <Link href="/profiles/new">
                  <Button variant="primary">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Criar primeiro perfil
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
