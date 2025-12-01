"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shell } from "@/components/layout";
import { Button, Card, CardContent, Stepper } from "@/components/ui";
import { PROFILE_PRESETS, getPresetById, isMacMSeriesTemplate } from "@/lib/presets";

const steps = [
  { label: "Básico" },
  { label: "Fingerprint" },
  { label: "Rede" },
  { label: "Storage" },
  { label: "Automação" },
  { label: "Resumo" },
];

interface FormData {
  name: string;
  notes: string;
  template: string;
  userAgent: string;
  os: string;
  proxyType: string;
  proxyAddress: string;
  storagePath: string;
  startupUrl: string;
  startupScript: string;
}

export default function NewProfilePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    notes: "",
    template: "",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
    os: "windows",
    proxyType: "none",
    proxyAddress: "",
    storagePath: "",
    startupUrl: "",
    startupScript: "",
  });

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTemplateSelect = (templateId: string) => {
    const preset = getPresetById(templateId);
    if (preset) {
      setFormData((prev) => ({
        ...prev,
        template: templateId,
        os: preset.os,
        userAgent: preset.userAgent,
      }));
    } else {
      // Reset to empty template
      setFormData((prev) => ({
        ...prev,
        template: "",
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

  const handleCreate = () => {
    console.log("Creating profile with data:", formData);
    alert("Perfil criado com sucesso! (mock)");
    router.push("/profiles");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            {/* Template Selector */}
            <div>
              <label htmlFor="template" className="block text-sm font-medium text-foreground mb-2">
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
                  {PROFILE_PRESETS.filter(p => p.category === "macos").map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.displayName}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Windows">
                  {PROFILE_PRESETS.filter(p => p.category === "windows").map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.displayName}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Linux">
                  {PROFILE_PRESETS.filter(p => p.category === "linux").map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.displayName}
                    </option>
                  ))}
                </optgroup>
              </select>
              <p className="text-xs text-foreground-muted mt-2">
                Selecione um template para pré-configurar o perfil com valores otimizados.
              </p>
            </div>

            {/* Help text for Mac M-series templates */}
            {formData.template && isMacMSeriesTemplate(formData.template) && (
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                <h4 className="text-sm font-medium text-accent mb-2">
                  ℹ️ Sobre os templates Mac M-series
                </h4>
                <p className="text-xs text-foreground-muted">
                  Estes templates são <strong>perfis Mac modernos</strong> baseados em fingerprint coerente
                  (User Agent, WebGL, screen, etc.). Diferenças exatas entre M3/M4 são principalmente
                  de fingerprint fino, que será refinado com dados reais em futuras versões.
                </p>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
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
              <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
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
      case 1:
        return (
          <div className="space-y-6">
            {/* Show selected template info */}
            {formData.template && (
              <div className="p-4 rounded-lg bg-background-tertiary border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-foreground">
                    Template: {getPresetById(formData.template)?.displayName}
                  </span>
                </div>
                <p className="text-xs text-foreground-muted">
                  Os valores abaixo foram pré-configurados pelo template selecionado. Você pode ajustá-los manualmente se necessário.
                </p>
              </div>
            )}
            <div>
              <label htmlFor="os" className="block text-sm font-medium text-foreground mb-2">
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
              <label htmlFor="userAgent" className="block text-sm font-medium text-foreground mb-2">
                User Agent
              </label>
              <textarea
                id="userAgent"
                value={formData.userAgent}
                onChange={(e) => updateFormData("userAgent", e.target.value)}
                rows={3}
                className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground font-mono text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
              />
              <p className="text-xs text-foreground-muted mt-2">
                O User Agent será gerado automaticamente pelo BrowserForge se deixado vazio.
              </p>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="proxyType" className="block text-sm font-medium text-foreground mb-2">
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
            {formData.proxyType !== "none" && (
              <div>
                <label htmlFor="proxyAddress" className="block text-sm font-medium text-foreground mb-2">
                  Endereço do Proxy
                </label>
                <input
                  type="text"
                  id="proxyAddress"
                  value={formData.proxyAddress}
                  onChange={(e) => updateFormData("proxyAddress", e.target.value)}
                  placeholder="Ex: user:pass@host:port"
                  className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
                />
              </div>
            )}
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="storagePath" className="block text-sm font-medium text-foreground mb-2">
                Caminho de armazenamento (opcional)
              </label>
              <input
                type="text"
                id="storagePath"
                value={formData.storagePath}
                onChange={(e) => updateFormData("storagePath", e.target.value)}
                placeholder="Ex: /path/to/profile/folder"
                className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
              <p className="text-xs text-foreground-muted mt-2">
                Deixe vazio para usar o caminho padrão do sistema.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background-tertiary border border-border">
              <h4 className="text-sm font-medium text-foreground mb-2">Dados armazenados</h4>
              <ul className="text-xs text-foreground-muted space-y-1">
                <li>• Cookies e sessões</li>
                <li>• Local Storage e IndexedDB</li>
                <li>• Cache do navegador</li>
                <li>• Histórico de navegação</li>
              </ul>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="startupUrl" className="block text-sm font-medium text-foreground mb-2">
                URL inicial (opcional)
              </label>
              <input
                type="text"
                id="startupUrl"
                value={formData.startupUrl}
                onChange={(e) => updateFormData("startupUrl", e.target.value)}
                placeholder="Ex: https://example.com"
                className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="startupScript" className="block text-sm font-medium text-foreground mb-2">
                Script de inicialização (opcional)
              </label>
              <textarea
                id="startupScript"
                value={formData.startupScript}
                onChange={(e) => updateFormData("startupScript", e.target.value)}
                placeholder="// JavaScript a ser executado ao iniciar..."
                rows={4}
                className="w-full px-4 py-2.5 bg-background-tertiary border border-border rounded-lg text-foreground font-mono text-sm placeholder-foreground-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-colors resize-none"
              />
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-success/10 border border-success/20">
              <h4 className="text-sm font-medium text-success mb-1">Pronto para criar!</h4>
              <p className="text-xs text-foreground-muted">
                Revise as configurações abaixo antes de criar o perfil.
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground-muted">Nome</span>
                <span className="text-sm text-foreground font-medium">
                  {formData.name || "Não definido"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground-muted">Template</span>
                <span className="text-sm text-foreground font-medium">
                  {formData.template ? getPresetById(formData.template)?.displayName : "Nenhum"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground-muted">Sistema Operacional</span>
                <span className="text-sm text-foreground font-medium capitalize">
                  {formData.os}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground-muted">Proxy</span>
                <span className="text-sm text-foreground font-medium">
                  {formData.proxyType === "none" ? "Nenhum" : formData.proxyAddress || "Configurado"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-foreground-muted">URL Inicial</span>
                <span className="text-sm text-foreground font-medium">
                  {formData.startupUrl || "Nenhuma"}
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Shell title="Novo perfil">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Novo perfil</h2>
            <p className="text-foreground-muted mt-1">
              Configure um novo perfil de navegador anti-detect.
            </p>
          </div>
          <Link href="/profiles">
            <Button variant="ghost">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar
            </Button>
          </Link>
        </div>

        {/* Stepper */}
        <Stepper steps={steps} currentStep={currentStep} className="mb-8" />

        {/* Step Content */}
        <Card>
          <CardContent>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-foreground">{steps[currentStep].label}</h3>
              <p className="text-sm text-foreground-muted mt-1">
                {currentStep === 0 && "Defina as informações básicas do perfil."}
                {currentStep === 1 && "Configure as propriedades de fingerprint."}
                {currentStep === 2 && "Configure as opções de rede e proxy."}
                {currentStep === 3 && "Configure o armazenamento de dados."}
                {currentStep === 4 && "Configure scripts e automação."}
                {currentStep === 5 && "Revise e confirme as configurações."}
              </p>
            </div>
            {renderStepContent()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </Button>
          {currentStep < steps.length - 1 ? (
            <Button variant="primary" onClick={handleNext}>
              Continuar
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          ) : (
            <Button variant="primary" onClick={handleCreate}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Criar perfil (mock)
            </Button>
          )}
        </div>
      </div>
    </Shell>
  );
}
