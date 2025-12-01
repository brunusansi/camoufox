# Running Mac-like Profiles from Windows

This guide explains how to run Camoufox with a macOS fingerprint while physically running on a Windows machine.

## Overview

While it's impossible to perfectly emulate macOS at the binary level, Camoufox can spoof the browser-visible fingerprint properties that websites commonly check. This guide helps you create and maintain high-quality Mac profiles for use on Windows.

## Quick Start

### Using the CLI

```python
from camoufox import Camoufox, get_preset

# Get a Mac profile preset
profile = get_preset("macos_apple_silicon")

# Convert to config and launch
with Camoufox(config=profile.to_camoufox_config()) as browser:
    page = browser.new_page()
    page.goto("https://www.browserscan.net/")
```

### Using the UI

1. Open the Camoufox Control Panel (`npm run dev` in the `ui/` directory)
2. Click "Create new profile"
3. In the Template selector, choose "MacBook M1 (Chrome)" or similar
4. Customize settings as needed
5. Review the Consistency Check panel for warnings
6. Click "Create profile"

## What Gets Spoofed

### ✅ Reliably Spoofed

| Property | Mac Value (Example) |
|----------|---------------------|
| `navigator.userAgent` | `Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15...)` |
| `navigator.platform` | `MacIntel` |
| `navigator.oscpu` | `Intel Mac OS X 10.15` |
| `navigator.languages` | `["en-US", "en"]` |
| `screen.width/height` | `1920x1080` (or Retina equivalent) |
| `devicePixelRatio` | `2.0` (Retina) or `1.0` |
| WebGL vendor/renderer | `Apple Inc.` / `Apple M1` |
| Timezone | `America/Los_Angeles` |

### ⚠️ Partially Spoofed

| Property | Notes |
|----------|-------|
| Fonts | Camoufox includes Mac fonts, but some system fonts may differ |
| Canvas fingerprint | Randomized, but not pixel-perfect Mac rendering |
| Audio fingerprint | Randomized |

### ❌ Cannot Be Spoofed

| Property | Why |
|----------|-----|
| Binary format | Windows runs EXE, Mac runs Mach-O |
| Kernel behavior | OS-level differences |
| TCP/IP stack | Network timing differences |
| Process execution | OS-specific behaviors |

## Configuration Checklist

### Essential Settings

1. **Navigator properties must be consistent:**
   ```python
   profile.navigator.user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0"
   profile.navigator.platform = "MacIntel"
   profile.navigator.oscpu = "Intel Mac OS X 10.15"
   ```

2. **Screen should use Mac-typical values:**
   ```python
   # For Retina display
   profile.screen.device_pixel_ratio = 2.0
   profile.screen.width = 1920
   profile.screen.height = 1080
   ```

3. **WebGL should report Apple hardware:**
   ```python
   profile.webgl.vendor = "Apple Inc."
   profile.webgl.renderer = "Apple M1"
   ```

4. **Touch points should be 0:**
   ```python
   profile.navigator.max_touch_points = 0
   ```

### Proxy Configuration

If using a proxy, ensure your timezone and locale match the proxy location:

```python
# If your proxy exits in California:
profile.locale.timezone = "America/Los_Angeles"
profile.locale.region = "US"
profile.locale.language = "en"
```

### WebRTC Settings

To prevent IP leaks that could reveal your Windows host:

```python
# Option 1: Disable WebRTC entirely
profile.webrtc.mode = "disabled"

# Option 2: Spoof to proxy IP
profile.webrtc.mode = "proxy_only"
profile.webrtc.spoof_ipv4 = "your.proxy.ip.address"
```

## Validation

### Run Consistency Check

```python
from camoufox import validate_profile, get_preset

profile = get_preset("macos_apple_silicon")
report = validate_profile(profile)

if report.has_errors():
    print("Profile has issues:")
    print(report.format_human_readable())
else:
    print("Profile is consistent!")
```

### Manual Testing Sites

After launching with your Mac profile, test on these sites:

| Site | What to Check |
|------|---------------|
| [BrowserScan](https://www.browserscan.net/) | OS detection, WebGL, canvas |
| [CreepJS](https://abrahamjuliot.github.io/creepjs/) | Overall fingerprint coherence |
| [deviceinfo.me](https://deviceinfo.me/) | Navigator and screen properties |
| [WebRTC Test](https://browserleaks.net/webrtc) | IP leak prevention |

### Expected Results

On BrowserScan, you should see:
- Operating System: **macOS** (not Windows)
- Browser: **Firefox**
- WebGL Vendor: **Apple Inc.**
- No WebRTC leaks (if disabled)

## Common Issues and Solutions

### Issue: Website detects Windows

**Symptoms:** Site shows "Windows" despite Mac user agent

**Solutions:**
1. Check all navigator properties are Mac-consistent
2. Verify WebGL is reporting Apple hardware
3. Ensure screen.devicePixelRatio matches Mac (1.0 or 2.0)

### Issue: WebRTC leaking local IP

**Symptoms:** Fingerprint site shows your real Windows local IP

**Solutions:**
1. Set `webrtc.mode = "disabled"`
2. Or configure WebRTC IP spoofing

### Issue: "High entropy" or "suspicious" fingerprint

**Symptoms:** CreepJS or similar shows warnings

**Solutions:**
1. Use a preset rather than custom values
2. Ensure all properties are internally consistent
3. Use realistic hardware concurrency (4-8 for Mac)

### Issue: Fonts don't match Mac

**Symptoms:** Font fingerprinting reveals non-Mac fonts

**Solutions:**
1. Camoufox automatically loads Mac fonts when `target_os="macos"`
2. Avoid loading additional system fonts
3. Consider using `custom_fonts_only` option

## Sample Complete Configuration

```python
from camoufox import (
    Camoufox,
    ProfileConfig,
    NavigatorConfig,
    ScreenConfig,
    LocaleConfig,
    WebGLConfig,
    WebRTCConfig,
)

# Complete Mac profile for US West Coast
profile = ProfileConfig(
    name="Mac California",
    target_os="macos",
    navigator=NavigatorConfig(
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) Gecko/20100101 Firefox/133.0",
        platform="MacIntel",
        oscpu="Intel Mac OS X 10.15",
        hardware_concurrency=8,
        max_touch_points=0,
        languages=["en-US", "en"],
    ),
    screen=ScreenConfig(
        width=1920,
        height=1080,
        avail_width=1920,
        avail_height=1055,
        device_pixel_ratio=2.0,
        color_depth=30,
    ),
    locale=LocaleConfig(
        language="en",
        region="US",
        timezone="America/Los_Angeles",
    ),
    webgl=WebGLConfig(
        enabled=True,
        vendor="Apple Inc.",
        renderer="Apple M1",
    ),
    webrtc=WebRTCConfig(
        mode="disabled",
    ),
)

# Launch and use
config = profile.to_camoufox_config()
firefox_prefs = profile.get_firefox_prefs()

with Camoufox(
    config=config,
    firefox_user_prefs=firefox_prefs,
) as browser:
    page = browser.new_page()
    page.goto("https://www.browserscan.net/")
    # ... your automation code
```

## Realistic Expectations

### What This Approach CAN Do

- Make websites see "macOS" in fingerprint checks
- Pass basic bot detection that checks user agent
- Present a coherent, consistent Mac fingerprint
- Avoid obvious "Windows pretending to be Mac" signals

### What This Approach CANNOT Do

- Fool kernel-level detection
- Perfectly emulate Mac font rendering
- Survive deep binary analysis
- Bypass extremely sophisticated antifraud systems that look at execution-level signals

### When This Works Well

- Standard web scraping
- Social media automation
- E-commerce browsing
- Most CAPTCHA systems
- Common WAF/bot detection

### When This May Not Work

- High-security financial sites with advanced fraud detection
- Sites specifically designed to detect spoofing
- Government/security applications

## Further Reading

- [PROFILES.md](PROFILES.md) - Complete profile system documentation
- [Main README](../README.md) - Camoufox overview
- [BrowserForge](https://github.com/daijro/browserforge) - Fingerprint generation
