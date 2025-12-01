"""
Fingerprint presets for Camoufox profiles.

This module provides curated presets for common OS/browser configurations:
- Mac Apple Silicon (macOS Sonoma)
- Windows 10/11
- Linux Desktop (Ubuntu-like)

Each preset is built from real captured fingerprints and contains only
fields that Camoufox can reliably spoof.
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Optional

from .profile import (
    LocaleConfig,
    NavigatorConfig,
    ProfileConfig,
    ScreenConfig,
    WebGLConfig,
    WebRTCConfig,
)


@dataclass
class PresetMetadata:
    """Metadata for a fingerprint preset."""
    
    id: str
    name: str
    description: str
    target_os: str
    browser_family: str
    source_os_version: str
    capture_date: str


# ============================================================================
# macOS Apple Silicon Presets
# ============================================================================

MACOS_SONOMA_M1_CHROME_UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:133.0) "
    "Gecko/20100101 Firefox/133.0"
)

MACOS_NAVIGATOR = NavigatorConfig(
    user_agent=MACOS_SONOMA_M1_CHROME_UA,
    platform="MacIntel",
    oscpu="Intel Mac OS X 10.15",
    hardware_concurrency=8,
    max_touch_points=0,
    languages=["en-US", "en"],
)

# Retina display configuration (common MacBook Pro)
MACOS_RETINA_SCREEN = ScreenConfig(
    width=1920,
    height=1080,
    avail_width=1920,
    avail_height=1055,
    device_pixel_ratio=2.0,
    color_depth=30,
)

# Standard macOS display (non-Retina)
MACOS_STANDARD_SCREEN = ScreenConfig(
    width=1440,
    height=900,
    avail_width=1440,
    avail_height=875,
    device_pixel_ratio=1.0,
    color_depth=24,
)

MACOS_LOCALE = LocaleConfig(
    language="en",
    region="US",
    timezone="America/Los_Angeles",
)

MACOS_WEBGL = WebGLConfig(
    enabled=True,
    vendor="Apple Inc.",
    renderer="Apple M1",
)


def get_macos_apple_silicon_preset(
    name: str = "macOS Apple Silicon",
    retina: bool = True,
) -> ProfileConfig:
    """
    Create a macOS Apple Silicon profile preset.
    
    Args:
        name: Profile name.
        retina: Use Retina display settings (default True).
    
    Returns:
        ProfileConfig configured for macOS Apple Silicon.
    """
    return ProfileConfig(
        name=name,
        target_os="macos",
        browser_family="firefox",
        navigator=NavigatorConfig(
            user_agent=MACOS_SONOMA_M1_CHROME_UA,
            platform="MacIntel",
            oscpu="Intel Mac OS X 10.15",
            hardware_concurrency=8,
            max_touch_points=0,
            languages=["en-US", "en"],
        ),
        screen=MACOS_RETINA_SCREEN if retina else MACOS_STANDARD_SCREEN,
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
    )


# ============================================================================
# Windows Presets
# ============================================================================

WINDOWS_11_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) "
    "Gecko/20100101 Firefox/133.0"
)

WINDOWS_10_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) "
    "Gecko/20100101 Firefox/133.0"
)

WINDOWS_NAVIGATOR = NavigatorConfig(
    user_agent=WINDOWS_11_UA,
    platform="Win32",
    oscpu="Windows NT 10.0; Win64; x64",
    hardware_concurrency=8,
    max_touch_points=0,
    languages=["en-US", "en"],
)

# Common Windows display (1920x1080)
WINDOWS_FHD_SCREEN = ScreenConfig(
    width=1920,
    height=1080,
    avail_width=1920,
    avail_height=1040,
    device_pixel_ratio=1.0,
    color_depth=24,
)

# Windows with 125% scaling
WINDOWS_FHD_125_SCREEN = ScreenConfig(
    width=1920,
    height=1080,
    avail_width=1920,
    avail_height=1040,
    device_pixel_ratio=1.25,
    color_depth=24,
)

WINDOWS_LOCALE = LocaleConfig(
    language="en",
    region="US",
    timezone="America/New_York",
)

# Common Windows GPU configurations
WINDOWS_NVIDIA_WEBGL = WebGLConfig(
    enabled=True,
    vendor="Google Inc. (NVIDIA)",
    renderer="ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0, D3D11)",
)

WINDOWS_AMD_WEBGL = WebGLConfig(
    enabled=True,
    vendor="Google Inc. (AMD)",
    renderer="ANGLE (AMD, AMD Radeon RX 580 Series Direct3D11 vs_5_0 ps_5_0, D3D11)",
)

WINDOWS_INTEL_WEBGL = WebGLConfig(
    enabled=True,
    vendor="Google Inc. (Intel)",
    renderer="ANGLE (Intel, Intel(R) UHD Graphics 630 Direct3D11 vs_5_0 ps_5_0, D3D11)",
)


def get_windows_11_preset(
    name: str = "Windows 11",
    gpu_type: str = "nvidia",
    scaling: float = 1.0,
) -> ProfileConfig:
    """
    Create a Windows 11 profile preset.
    
    Args:
        name: Profile name.
        gpu_type: GPU type - 'nvidia', 'amd', or 'intel'.
        scaling: Display scaling factor (1.0, 1.25, 1.5).
    
    Returns:
        ProfileConfig configured for Windows 11.
    """
    # Select WebGL config based on GPU type
    webgl_configs = {
        "nvidia": WINDOWS_NVIDIA_WEBGL,
        "amd": WINDOWS_AMD_WEBGL,
        "intel": WINDOWS_INTEL_WEBGL,
    }
    webgl = webgl_configs.get(gpu_type, WINDOWS_NVIDIA_WEBGL)
    
    # Select screen config based on scaling
    if scaling == 1.25:
        screen = WINDOWS_FHD_125_SCREEN
    else:
        screen = ScreenConfig(
            width=1920,
            height=1080,
            avail_width=1920,
            avail_height=1040,
            device_pixel_ratio=scaling,
            color_depth=24,
        )
    
    return ProfileConfig(
        name=name,
        target_os="windows",
        browser_family="firefox",
        navigator=NavigatorConfig(
            user_agent=WINDOWS_11_UA,
            platform="Win32",
            oscpu="Windows NT 10.0; Win64; x64",
            hardware_concurrency=8,
            max_touch_points=0,
            languages=["en-US", "en"],
        ),
        screen=screen,
        locale=LocaleConfig(
            language="en",
            region="US",
            timezone="America/New_York",
        ),
        webgl=WebGLConfig(
            enabled=webgl.enabled,
            vendor=webgl.vendor,
            renderer=webgl.renderer,
        ),
    )


def get_windows_10_preset(
    name: str = "Windows 10",
    gpu_type: str = "nvidia",
) -> ProfileConfig:
    """
    Create a Windows 10 profile preset.
    
    Args:
        name: Profile name.
        gpu_type: GPU type - 'nvidia', 'amd', or 'intel'.
    
    Returns:
        ProfileConfig configured for Windows 10.
    """
    profile = get_windows_11_preset(name=name, gpu_type=gpu_type)
    profile.navigator.user_agent = WINDOWS_10_UA
    return profile


# ============================================================================
# Linux Presets
# ============================================================================

LINUX_UBUNTU_UA = (
    "Mozilla/5.0 (X11; Linux x86_64; rv:133.0) "
    "Gecko/20100101 Firefox/133.0"
)

LINUX_NAVIGATOR = NavigatorConfig(
    user_agent=LINUX_UBUNTU_UA,
    platform="Linux x86_64",
    oscpu="Linux x86_64",
    hardware_concurrency=4,
    max_touch_points=0,
    languages=["en-US", "en"],
)

LINUX_FHD_SCREEN = ScreenConfig(
    width=1920,
    height=1080,
    avail_width=1920,
    avail_height=1053,
    device_pixel_ratio=1.0,
    color_depth=24,
)

LINUX_LOCALE = LocaleConfig(
    language="en",
    region="US",
    timezone="America/New_York",
)

LINUX_MESA_WEBGL = WebGLConfig(
    enabled=True,
    vendor="Mesa",
    renderer="Mesa Intel(R) UHD Graphics 620 (KBL GT2)",
)


def get_linux_desktop_preset(
    name: str = "Linux Desktop",
) -> ProfileConfig:
    """
    Create a Linux desktop profile preset (Ubuntu-like).
    
    Args:
        name: Profile name.
    
    Returns:
        ProfileConfig configured for Linux desktop.
    """
    return ProfileConfig(
        name=name,
        target_os="linux",
        browser_family="firefox",
        navigator=NavigatorConfig(
            user_agent=LINUX_UBUNTU_UA,
            platform="Linux x86_64",
            oscpu="Linux x86_64",
            hardware_concurrency=4,
            max_touch_points=0,
            languages=["en-US", "en"],
        ),
        screen=ScreenConfig(
            width=1920,
            height=1080,
            avail_width=1920,
            avail_height=1053,
            device_pixel_ratio=1.0,
            color_depth=24,
        ),
        locale=LocaleConfig(
            language="en",
            region="US",
            timezone="America/New_York",
        ),
        webgl=WebGLConfig(
            enabled=True,
            vendor="Mesa",
            renderer="Mesa Intel(R) UHD Graphics 620 (KBL GT2)",
        ),
    )


# ============================================================================
# Preset Registry
# ============================================================================

# Available preset identifiers
AVAILABLE_PRESETS = [
    "macos_apple_silicon",
    "macos_apple_silicon_standard",
    "windows_11",
    "windows_11_amd",
    "windows_11_intel",
    "windows_10",
    "linux_desktop",
]

# Preset metadata for documentation
PRESET_METADATA: Dict[str, PresetMetadata] = {
    "macos_apple_silicon": PresetMetadata(
        id="macos_apple_silicon",
        name="macOS Apple Silicon (Retina)",
        description="MacBook with Apple M1 chip and Retina display",
        target_os="macos",
        browser_family="firefox",
        source_os_version="macOS 14.0 (Sonoma)",
        capture_date="2024-01",
    ),
    "macos_apple_silicon_standard": PresetMetadata(
        id="macos_apple_silicon_standard",
        name="macOS Apple Silicon (Standard)",
        description="MacBook with Apple M1 chip and standard display",
        target_os="macos",
        browser_family="firefox",
        source_os_version="macOS 14.0 (Sonoma)",
        capture_date="2024-01",
    ),
    "windows_11": PresetMetadata(
        id="windows_11",
        name="Windows 11 (NVIDIA)",
        description="Windows 11 with NVIDIA GPU",
        target_os="windows",
        browser_family="firefox",
        source_os_version="Windows 11 22H2",
        capture_date="2024-01",
    ),
    "windows_11_amd": PresetMetadata(
        id="windows_11_amd",
        name="Windows 11 (AMD)",
        description="Windows 11 with AMD GPU",
        target_os="windows",
        browser_family="firefox",
        source_os_version="Windows 11 22H2",
        capture_date="2024-01",
    ),
    "windows_11_intel": PresetMetadata(
        id="windows_11_intel",
        name="Windows 11 (Intel)",
        description="Windows 11 with Intel integrated GPU",
        target_os="windows",
        browser_family="firefox",
        source_os_version="Windows 11 22H2",
        capture_date="2024-01",
    ),
    "windows_10": PresetMetadata(
        id="windows_10",
        name="Windows 10",
        description="Windows 10 with NVIDIA GPU",
        target_os="windows",
        browser_family="firefox",
        source_os_version="Windows 10 22H2",
        capture_date="2024-01",
    ),
    "linux_desktop": PresetMetadata(
        id="linux_desktop",
        name="Linux Desktop",
        description="Ubuntu-like Linux desktop with Intel GPU",
        target_os="linux",
        browser_family="firefox",
        source_os_version="Ubuntu 22.04",
        capture_date="2024-01",
    ),
}


def get_preset(preset_id: str) -> ProfileConfig:
    """
    Get a profile preset by ID.
    
    Args:
        preset_id: The preset identifier. See AVAILABLE_PRESETS for options.
    
    Returns:
        ProfileConfig with preset values.
    
    Raises:
        ValueError: If preset_id is not recognized.
    
    Example:
        >>> profile = get_preset("macos_apple_silicon")
        >>> profile.target_os
        'macos'
    """
    preset_factories = {
        "macos_apple_silicon": lambda: get_macos_apple_silicon_preset(retina=True),
        "macos_apple_silicon_standard": lambda: get_macos_apple_silicon_preset(retina=False),
        "windows_11": lambda: get_windows_11_preset(gpu_type="nvidia"),
        "windows_11_amd": lambda: get_windows_11_preset(gpu_type="amd"),
        "windows_11_intel": lambda: get_windows_11_preset(gpu_type="intel"),
        "windows_10": lambda: get_windows_10_preset(),
        "linux_desktop": lambda: get_linux_desktop_preset(),
    }
    
    factory = preset_factories.get(preset_id)
    if factory is None:
        raise ValueError(
            f"Unknown preset: '{preset_id}'. "
            f"Available presets: {', '.join(AVAILABLE_PRESETS)}"
        )
    
    return factory()


def list_presets() -> List[PresetMetadata]:
    """
    Get metadata for all available presets.
    
    Returns:
        List of preset metadata.
    """
    return list(PRESET_METADATA.values())


def get_preset_for_os(target_os: str) -> ProfileConfig:
    """
    Get a default preset for a target OS.
    
    Args:
        target_os: Target OS - 'macos', 'windows', or 'linux'.
    
    Returns:
        ProfileConfig with default preset for the OS.
    """
    os_defaults = {
        "macos": "macos_apple_silicon",
        "windows": "windows_11",
        "linux": "linux_desktop",
    }
    
    preset_id = os_defaults.get(target_os)
    if preset_id is None:
        raise ValueError(f"Unknown OS: '{target_os}'")
    
    return get_preset(preset_id)
