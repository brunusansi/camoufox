# Camoufox UI - Guia de Instalação

Este guia explica como configurar e executar a interface web do Camoufox localmente.

## Pré-requisitos

### 1. Node.js

Você precisa do Node.js versão 20.x ou superior instalado no seu sistema.

**Para verificar se já está instalado:**

```bash
node --version
```

**Para instalar o Node.js:**
- Acesse [nodejs.org](https://nodejs.org/) e baixe a versão LTS (recomendada)
- Ou use um gerenciador de versões como [nvm](https://github.com/nvm-sh/nvm)

### 2. pnpm (Gerenciador de Pacotes)

O projeto usa `pnpm` como gerenciador de pacotes. Instale-o globalmente:

```bash
npm install -g pnpm
```

**Para verificar se está instalado:**

```bash
pnpm --version
```

## Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/brunusansi/camoufox.git
cd camoufox
```

### 2. Acesse a pasta da UI

```bash
cd ui
```

### 3. Instale as dependências

```bash
pnpm install
```

### 4. Execute o servidor de desenvolvimento

```bash
pnpm dev
```

### 5. Acesse no navegador

Abra seu navegador e acesse:

```
http://localhost:3000
```

Você deve ver o painel de controle do Camoufox! 🦊

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia o servidor de desenvolvimento |
| `pnpm build` | Cria a versão de produção |
| `pnpm start` | Executa a versão de produção |
| `pnpm lint` | Verifica o código com ESLint |

## Notas Importantes

- **Dados simulados**: A interface atualmente usa dados mockados (simulados). A integração com o backend do Camoufox será implementada em versões futuras.
  
- **Modo escuro**: A interface usa exclusivamente o tema escuro por design.

- **Desenvolvimento local**: Esta UI é apenas para desenvolvimento local. Não execute em produção sem as devidas configurações de segurança.

## Resolução de Problemas

### "pnpm: command not found"

Se você receber este erro, o pnpm não está instalado ou não está no PATH. Execute:

```bash
npm install -g pnpm
```

### "Port 3000 is already in use"

Se a porta 3000 estiver em uso, você pode:

1. Fechar a aplicação que está usando a porta, ou
2. Usar uma porta diferente:

```bash
pnpm dev -- -p 3001
```

E acesse `http://localhost:3001`

### Erro de permissão ao instalar pnpm

Se você encontrar erros de permissão no Linux/macOS:

```bash
sudo npm install -g pnpm
```

### Dependências não encontradas

Se houver erros sobre módulos não encontrados, tente remover a pasta node_modules e reinstalar:

```bash
rm -rf node_modules
pnpm install
```

## Estrutura do Projeto

```
ui/
├── src/
│   ├── app/              # Páginas (Next.js App Router)
│   │   ├── page.tsx      # Dashboard
│   │   ├── profiles/     # Páginas de perfis
│   │   └── settings/     # Configurações
│   └── components/       # Componentes reutilizáveis
│       ├── layout/       # Layout (Shell, Sidebar, Topbar)
│       └── ui/           # UI (Button, Card, Stepper)
├── tailwind.config.ts    # Configuração do Tailwind
└── package.json          # Dependências
```

## Próximos Passos

Após instalar a UI, você pode:

1. Navegar pelo dashboard
2. Acessar a lista de perfis
3. Experimentar o wizard de criação de perfil

A integração com o core do Camoufox (Python) será adicionada em atualizações futuras.

---

**Precisa de ajuda?** Abra uma issue no [repositório do GitHub](https://github.com/brunusansi/camoufox/issues).
