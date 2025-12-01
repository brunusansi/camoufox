# Compatibilidade com Mac M-Series (M1–M4)

## Visão Geral

O Camoufox oferece compatibilidade prática com Macs da série M (M1, M2, M3, M4) através de **fingerprints coerentes** e **presets de perfil**. Este documento explica como essa compatibilidade funciona e como utilizá-la.

## Como Funciona

### Não Existe "Modo M3/M4" Oficial

É importante entender que **não existe uma API oficial de navegador** para "modo M3" ou "modo M4". Os navegadores não expõem diretamente qual chip Apple Silicon está sendo utilizado.

### Compatibilidade via Fingerprint

A compatibilidade com Mac M-series é alcançada através da apresentação de um **fingerprint Mac coerente**, que inclui:

- **User Agent**: String de UA configurada para macOS moderno
- **Sec-CH-UA Headers**: Headers Client Hints compatíveis com macOS
- **Versão do macOS**: Sonoma (14.x) ou Sequoia (15.x)
- **WebGL Vendor/Renderer**: Configuração compatível com Apple Silicon
- **Screen**: Resoluções típicas de MacBooks
- **Timezone**: Configurável para qualquer região
- **Languages**: Configurável para qualquer idioma

### O Que Diferencia M1/M2/M3/M4?

Na prática, as diferenças entre gerações de chips Apple Silicon (M1, M2, M3, M4) são **principalmente de fingerprint fino**:

- Versões específicas do macOS suportadas
- Possíveis diferenças em WebGL renderer strings
- Resolução de tela nativa do dispositivo

## Presets Disponíveis

O Camoufox inclui presets pré-configurados para Mac M-series:

| Preset ID | Nome no UI | Descrição |
|-----------|------------|-----------|
| `macos_m3_chrome_moderno` | MacBook M3 – Chrome (Sonoma/Sequoia) | Perfil Mac moderno otimizado para M3 |
| `macos_m4_chrome_moderno` | MacBook M4 – Chrome (Sonoma/Sequoia) | Perfil Mac moderno otimizado para M4 |

> **Nota**: Atualmente, estes presets utilizam o mesmo fingerprint base de "Mac moderno", pois as diferenças entre gerações M são sutis. Eles serão refinados com fingerprints reais específicos em versões futuras.

## Utilizando os Presets

### Via UI (Interface Gráfica)

1. Acesse **Perfis** > **Novo perfil**
2. No passo **Básico** ou **Fingerprint**, selecione o **Template/Modelo** desejado
3. Escolha "MacBook M3 – Chrome (Sonoma/Sequoia)" ou "MacBook M4 – Chrome (Sonoma/Sequoia)"
4. O perfil será pré-configurado com os valores apropriados

### Via Código (Python)

```python
from camoufox.sync_api import Camoufox

# Exemplo de configuração manual de fingerprint Mac moderno
config = {
    'navigator.platform': 'MacIntel',
    'navigator.userAgent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    # ... outras propriedades de fingerprint
}

with Camoufox(config=config) as browser:
    page = browser.new_page()
    # ...
```

## Adicionando Novas Gerações (M4, M5, etc.)

Para adicionar suporte a novas gerações de chips Apple Silicon no futuro:

1. **Capturar fingerprints reais** de dispositivos com o novo chip
2. **Criar novos presets** baseados na mesma arquitetura de perfis existente
3. **Atualizar a documentação** com os novos identificadores

Este processo garante que o Camoufox possa evoluir para suportar novos hardwares à medida que são lançados.

## Limitações

- O Camoufox não pode emular comportamentos específicos de hardware (performance, capacidades de GPU específicas, etc.)
- Alguns sites de detecção avançada podem identificar inconsistências entre fingerprint e comportamento real
- WebGL fingerprinting pode variar entre dispositivos reais

## FAQ

**P: O preset M3/M4 é diferente de um preset Mac genérico?**

R: Atualmente, os presets M3/M4 são baseados no mesmo fingerprint Mac moderno. A separação existe para facilitar refinamentos futuros com dados específicos de cada geração.

**P: Preciso de um Mac real para usar esses presets?**

R: Não. Os presets funcionam em qualquer sistema operacional (Windows, Linux, macOS). O Camoufox simula o fingerprint sem precisar do hardware real.

**P: Como sei qual preset usar?**

R: Se você precisa simular um Mac moderno e não tem requisitos específicos de geração, qualquer preset M3/M4 funcionará bem. Escolha baseado na versão do macOS que deseja simular (Sonoma ou Sequoia).
