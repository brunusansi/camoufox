# Camoufox Profile System

This document explains the Camoufox profile system, which allows you to create, manage, and maintain consistent browser fingerprints for web automation and anti-detection.

## Philosophy

**There is no such thing as 100% undetectable.** Instead, Camoufox focuses on:

1. **Coherence** - All fingerprint properties should be internally consistent
2. **Plausibility** - Values should match what real devices actually report
3. **Layered defense** - Multiple fingerprint aspects working together
4. **Testability** - Easy verification of fingerprint consistency

## Profile Model

A Camoufox profile (`ProfileConfig`) represents all configurable aspects of a browser fingerprint:

```python
from camoufox import ProfileConfig

profile = ProfileConfig(
    name="My Profile",
    target_os="macos",      # 'macos', 'windows', or 'linux'
    browser_family="firefox",
    # ... other settings
)
```

### Profile Components

| Component | Description |
|-----------|-------------|
| `navigator` | User-Agent, platform, oscpu, languages, hardware concurrency |
| `screen` | Resolution, available dimensions, device pixel ratio, color depth |
| `locale` | Language, region, timezone |
| `webgl` | WebGL vendor/renderer |
| `proxy` | Proxy type and server |
| `webrtc` | WebRTC mode (disabled/proxy_only/default) |
| `storage` | User data directory, persistence settings |

## Using Presets

The easiest way to create a profile is using presets - curated configurations based on real device fingerprints.

### Available Presets

| Preset ID | Description |
|-----------|-------------|
| `macos_apple_silicon` | MacBook with M1 chip and Retina display |
| `macos_apple_silicon_standard` | MacBook with M1 chip, standard display |
| `windows_11` | Windows 11 with NVIDIA GPU |
| `windows_11_amd` | Windows 11 with AMD GPU |
| `windows_11_intel` | Windows 11 with Intel integrated GPU |
| `windows_10` | Windows 10 with NVIDIA GPU |
| `linux_desktop` | Ubuntu-like Linux with Intel GPU |

### Using a Preset

```python
from camoufox import get_preset, save_profile

# Get a Mac preset
profile = get_preset("macos_apple_silicon")
profile.name = "My Mac Profile"

# Customize if needed
profile.locale.timezone = "Europe/London"

# Save for later use
save_profile(profile)
```

### Quick Preset Selection by OS

```python
from camoufox import get_preset_for_os

# Get default preset for an OS
mac_profile = get_preset_for_os("macos")
win_profile = get_preset_for_os("windows")
linux_profile = get_preset_for_os("linux")
```

## Capturing Real Fingerprints

To create or update presets, you should capture fingerprints from real devices.

### Recommended Tools

1. **[deviceinfo.me](https://deviceinfo.me)** - Comprehensive device info
2. **[BrowserScan](https://www.browserscan.net)** - Browser fingerprint details
3. **[CreepJS](https://abrahamjuliot.github.io/creepjs)** - Advanced fingerprint analysis
4. **[AmIUnique](https://amiunique.org)** - Fingerprint uniqueness check

### Capture Process

1. **Use a real device** - Run the fingerprint site on the actual target OS (Mac, Windows, Linux)
2. **Use Firefox** - Camoufox is Firefox-based; use Firefox for captures
3. **Record key values:**
   - User-Agent string
   - `navigator.platform`
   - `navigator.oscpu`
   - Screen dimensions (width, height, availWidth, availHeight)
   - Device pixel ratio
   - WebGL renderer and vendor
   - Timezone
   - Hardware concurrency

### Example Capture Script

```python
# Save this as a bookmark or run in DevTools:
"""
console.log(JSON.stringify({
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    oscpu: navigator.oscpu,
    languages: navigator.languages,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
    screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
        devicePixelRatio: window.devicePixelRatio
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
}, null, 2));
"""
```

## Consistency Validation

Camoufox validates profiles for internal consistency to catch obvious mismatches that could expose spoofing.

### Running Validation

```python
from camoufox import validate_profile, ProfileConfig

profile = ProfileConfig(
    name="Test",
    target_os="macos",
)
profile.navigator.platform = "Win32"  # Mismatch!

report = validate_profile(profile)
print(report.format_human_readable())
```

### Issue Levels

| Level | Description |
|-------|-------------|
| `ERROR` | Critical inconsistency that will likely cause detection |
| `WARNING` | Potential issue that should be reviewed |
| `INFO` | Informational note about unusual (but valid) configuration |

### Automatic Enforcement

```python
from camoufox import enforce_os_consistency

# Automatically fix OS-related mismatches
profile = enforce_os_consistency(profile)
```

## Profile Storage

Profiles are stored as JSON files in the `profiles/` directory.

### Saving and Loading

```python
from camoufox import save_profile, load_profile, list_profiles, delete_profile

# Save a profile
save_profile(profile)

# Load by ID
loaded = load_profile(profile.id)

# List all profiles
for p in list_profiles():
    print(f"{p.name} ({p.id})")

# Delete a profile
delete_profile(profile.id)
```

### Custom Storage Location

```python
from camoufox import ProfileStorage

storage = ProfileStorage("/path/to/profiles")
storage.save(profile)
```

## Converting to Camoufox Config

Profiles can be converted to Camoufox configuration dictionaries:

```python
from camoufox import Camoufox, get_preset

profile = get_preset("macos_apple_silicon")

# Get config dictionary
config = profile.to_camoufox_config()

# Use directly with Camoufox
with Camoufox(config=config) as browser:
    page = browser.new_page()
    # ...
```

## Preset Versioning

Presets should be refreshed periodically as:
- Browser versions update
- OS versions change
- Detection techniques evolve

### Version Information

Each preset includes metadata:

```python
from camoufox.presets import PRESET_METADATA

meta = PRESET_METADATA["macos_apple_silicon"]
print(f"Source: {meta.source_os_version}")
print(f"Captured: {meta.capture_date}")
```

## Best Practices

1. **Match proxy location to timezone/locale** - A US timezone with a German IP is suspicious
2. **Use realistic hardware values** - 64 CPU cores on a "MacBook" is unusual
3. **Keep WebGL consistent with OS** - Don't use Direct3D on macOS
4. **Consider screen scaling** - macOS typically uses 1.0 or 2.0 DPR
5. **Test regularly** - Use fingerprint testing sites to verify your profiles

## Limitations

Camoufox cannot spoof:
- Binary/executable format (Windows EXE vs macOS Mach-O)
- Kernel-level behavior
- Hardware timing characteristics
- Some WebGL shader quirks
- Font rendering differences at the pixel level

Focus on what CAN be controlled reliably: navigator properties, screen dimensions, locale, timezone, and WebGL identifiers.

## Related Documentation

- [WINDOWS_MAC_PROFILE.md](WINDOWS_MAC_PROFILE.md) - Running Mac profiles from Windows
- [README.md](../README.md) - Main Camoufox documentation
- [pythonlib/README.md](../pythonlib/README.md) - Python library documentation
