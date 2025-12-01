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

### 3. Python 3 (para iniciar perfis)

Para iniciar navegadores Camoufox a partir da UI, você precisa do Python 3.8+ instalado.

**Para verificar se já está instalado:**

```bash
python3 --version
```

**Instale as dependências Python:**

```bash
cd pythonlib
pip install -e .
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

## Usando Perfis

### Onde os perfis são salvos

Os perfis são salvos como arquivos JSON no diretório `profiles/` na raiz do repositório:

```
camoufox/
├── profiles/
│   ├── <uuid>.json      # Cada perfil é um arquivo JSON
│   └── README.md
├── ui/
└── ...
```

### Como criar um perfil

1. Acesse **http://localhost:3000/profiles**
2. Clique em **"Novo perfil"**
3. Escolha um template (Windows, macOS, Linux) ou comece do zero
4. Configure o nome, fingerprint, rede e storage
5. Revise e clique em **"Criar perfil"**

### Como iniciar um perfil

1. Na lista de perfis, localize o perfil desejado
2. Clique no botão **"Iniciar"** (ícone de play verde)
3. O Camoufox será iniciado com as configurações do perfil
4. O navegador abrirá em modo headful (com interface gráfica)

> **Nota:** Para que o botão "Iniciar" funcione, você precisa ter o Python 3 e as dependências do pythonlib instaladas (veja pré-requisitos).

## Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Inicia o servidor de desenvolvimento |
| `pnpm build` | Cria a versão de produção |
| `pnpm start` | Executa a versão de produção |
| `pnpm lint` | Verifica o código com ESLint |

## API Endpoints (Local Only)

A UI expõe uma API REST para gerenciar perfis. **Esta API é apenas para uso local.**

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/profiles` | GET | Lista todos os perfis |
| `/api/profiles` | POST | Cria um novo perfil |
| `/api/profiles/:id` | GET | Retorna um perfil específico |
| `/api/profiles/:id` | DELETE | Deleta um perfil |
| `/api/profiles/:id/run` | POST | Inicia o Camoufox com o perfil |

> ⚠️ **SEGURANÇA:** Esta API é destinada apenas para uso local (localhost). Não exponha para a internet.

## Notas Importantes

- **Persistência real**: Os perfis são salvos em disco no diretório `profiles/`. Não são mais mockados.
  
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

### Erro ao iniciar perfil: "python3: command not found"

Certifique-se de que o Python 3 está instalado e acessível via `python3` (Linux/macOS) ou `python` (Windows).

### Erro ao iniciar perfil: "camoufox module not found"

Instale as dependências Python do projeto:

```bash
cd pythonlib
pip install -e .
```

## Estrutura do Projeto

```
camoufox/
├── profiles/             # Diretório de perfis JSON
├── pythonlib/            # Biblioteca Python do Camoufox
│   └── camoufox/
│       ├── profile.py    # Modelo de perfil (Python)
│       └── ...
├── scripts/
│   └── launch_profile.py # Script para iniciar perfis
├── ui/
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/      # Rotas API (Next.js)
│   │   │   │   └── profiles/
│   │   │   ├── profiles/ # Páginas de perfis
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── profile-types.ts    # Tipos TypeScript
│   │   │   └── profile-storage.ts  # Serviço de storage
│   │   └── components/
│   └── package.json
└── docs/
    └── PROFILES.md       # Documentação do sistema de perfis
```

## Próximos Passos

Após instalar a UI, você pode:

1. Navegar pelo dashboard
2. Acessar a lista de perfis em `/profiles`
3. Criar um novo perfil com o wizard
4. Iniciar um navegador Camoufox com o perfil criado

---

**Precisa de ajuda?** Abra uma issue no [repositório do GitHub](https://github.com/brunusansi/camoufox/issues).
