"""
Profile model and storage layer for Camoufox profiles.

This module provides:
- ProfileConfig: A typed, versioned profile model
- Profile persistence as JSON files
- Read/write helpers for CLI and UI consumption
"""

import os
import uuid
from dataclasses import asdict, dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Literal, Optional, Union

import orjson

# Profile schema version for future migrations
PROFILE_SCHEMA_VERSION = "1.0.0"

# Default profiles directory (relative to repository root)
DEFAULT_PROFILES_DIR = Path(__file__).parent.parent.parent.parent / "profiles"


@dataclass
class ProxyConfig:
    """Proxy configuration for browser profiles."""
    
    type: Literal["none", "http", "socks5"] = "none"
    server: str = ""
    username: Optional[str] = None
    password: Optional[str] = None
    
    def to_playwright_proxy(self) -> Optional[Dict[str, str]]:
        """Convert to Playwright proxy format."""
        if self.type == "none" or not self.server:
            return None
        proxy: Dict[str, str] = {"server": self.server}
        if self.username:
            proxy["username"] = self.username
        if self.password:
            proxy["password"] = self.password
        return proxy


@dataclass
class WebRTCConfig:
    """WebRTC configuration for browser profiles."""
    
    mode: Literal["disabled", "proxy_only", "default"] = "default"
    spoof_ipv4: Optional[str] = None
    spoof_ipv6: Optional[str] = None
    
    def get_firefox_prefs(self) -> Dict[str, Any]:
        """Get Firefox preferences for WebRTC mode."""
        prefs: Dict[str, Any] = {}
        if self.mode == "disabled":
            prefs["media.peerconnection.enabled"] = False
        return prefs


@dataclass
class ScreenConfig:
    """Screen configuration for fingerprint spoofing."""
    
    width: int = 1920
    height: int = 1080
    avail_width: int = 1920
    avail_height: int = 1040
    device_pixel_ratio: float = 1.0
    color_depth: int = 24
    
    def to_camoufox_config(self) -> Dict[str, Any]:
        """Convert to Camoufox config format."""
        return {
            "screen.width": self.width,
            "screen.height": self.height,
            "screen.availWidth": self.avail_width,
            "screen.availHeight": self.avail_height,
            "window.devicePixelRatio": self.device_pixel_ratio,
            "screen.colorDepth": self.color_depth,
            "screen.pixelDepth": self.color_depth,
        }


@dataclass
class NavigatorConfig:
    """Navigator properties for fingerprint spoofing."""
    
    user_agent: str = ""
    platform: str = ""
    oscpu: str = ""
    hardware_concurrency: int = 4
    max_touch_points: int = 0
    languages: List[str] = field(default_factory=lambda: ["en-US", "en"])
    
    def to_camoufox_config(self) -> Dict[str, Any]:
        """Convert to Camoufox config format."""
        config: Dict[str, Any] = {
            "navigator.hardwareConcurrency": self.hardware_concurrency,
            "navigator.maxTouchPoints": self.max_touch_points,
        }
        if self.user_agent:
            config["navigator.userAgent"] = self.user_agent
        if self.platform:
            config["navigator.platform"] = self.platform
        if self.oscpu:
            config["navigator.oscpu"] = self.oscpu
        if self.languages:
            config["navigator.languages"] = self.languages
            config["navigator.language"] = self.languages[0]
        return config


@dataclass
class LocaleConfig:
    """Locale and timezone configuration."""
    
    language: str = "en"
    region: str = "US"
    timezone: str = "America/New_York"
    
    def to_camoufox_config(self) -> Dict[str, Any]:
        """Convert to Camoufox config format."""
        return {
            "locale:language": self.language,
            "locale:region": self.region,
            "timezone": self.timezone,
        }


@dataclass
class WebGLConfig:
    """WebGL configuration for fingerprint spoofing."""
    
    enabled: bool = True
    vendor: str = ""
    renderer: str = ""
    
    def get_firefox_prefs(self) -> Dict[str, Any]:
        """Get Firefox preferences for WebGL."""
        prefs: Dict[str, Any] = {}
        if not self.enabled:
            prefs["webgl.disabled"] = True
        return prefs
    
    def to_camoufox_config(self) -> Dict[str, Any]:
        """Convert to Camoufox config format."""
        config: Dict[str, Any] = {}
        if self.vendor:
            config["webGl:vendor"] = self.vendor
        if self.renderer:
            config["webGl:renderer"] = self.renderer
        return config


@dataclass
class StorageConfig:
    """Storage configuration for browser profiles."""
    
    user_data_dir: Optional[str] = None
    persistent_cookies: bool = True
    
    def get_playwright_options(self) -> Dict[str, Any]:
        """Get Playwright launch options for storage."""
        options: Dict[str, Any] = {}
        if self.user_data_dir:
            options["user_data_dir"] = self.user_data_dir
        return options


@dataclass
class ProfileConfig:
    """
    Main profile configuration model.
    
    This is a typed, versioned profile model that represents all configurable
    aspects of a Camoufox browser profile including:
    - Target OS and browser
    - Core fingerprint fields
    - Network settings
    - Storage settings
    """
    
    # Metadata
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    name: str = ""
    notes: str = ""
    version: str = PROFILE_SCHEMA_VERSION
    created_at: str = field(default_factory=lambda: datetime.now().isoformat())
    updated_at: str = field(default_factory=lambda: datetime.now().isoformat())
    
    # Target configuration
    target_os: Literal["macos", "windows", "linux"] = "windows"
    browser_family: Literal["firefox"] = "firefox"
    
    # Fingerprint components
    navigator: NavigatorConfig = field(default_factory=NavigatorConfig)
    screen: ScreenConfig = field(default_factory=ScreenConfig)
    locale: LocaleConfig = field(default_factory=LocaleConfig)
    webgl: WebGLConfig = field(default_factory=WebGLConfig)
    
    # Network settings
    proxy: ProxyConfig = field(default_factory=ProxyConfig)
    webrtc: WebRTCConfig = field(default_factory=WebRTCConfig)
    
    # Storage settings
    storage: StorageConfig = field(default_factory=StorageConfig)
    
    # Automation settings
    startup_url: str = ""
    startup_script: str = ""
    
    # Custom Camoufox config overrides
    custom_config: Dict[str, Any] = field(default_factory=dict)
    
    def touch(self) -> None:
        """Update the updated_at timestamp."""
        self.updated_at = datetime.now().isoformat()
    
    def to_camoufox_config(self) -> Dict[str, Any]:
        """
        Convert profile to Camoufox config dictionary.
        
        Returns a config dictionary that can be passed to Camoufox launcher.
        """
        config: Dict[str, Any] = {}
        
        # Merge all component configs
        config.update(self.navigator.to_camoufox_config())
        config.update(self.screen.to_camoufox_config())
        config.update(self.locale.to_camoufox_config())
        config.update(self.webgl.to_camoufox_config())
        
        # Add WebRTC spoofing if configured
        if self.webrtc.spoof_ipv4:
            config["webrtc:ipv4"] = self.webrtc.spoof_ipv4
        if self.webrtc.spoof_ipv6:
            config["webrtc:ipv6"] = self.webrtc.spoof_ipv6
        
        # Merge custom config (allows overrides)
        config.update(self.custom_config)
        
        return config
    
    def get_firefox_prefs(self) -> Dict[str, Any]:
        """Get Firefox user preferences from profile."""
        prefs: Dict[str, Any] = {}
        prefs.update(self.webrtc.get_firefox_prefs())
        prefs.update(self.webgl.get_firefox_prefs())
        return prefs
    
    def get_playwright_options(self) -> Dict[str, Any]:
        """Get Playwright launch options from profile."""
        options: Dict[str, Any] = {}
        
        # Add proxy if configured
        proxy = self.proxy.to_playwright_proxy()
        if proxy:
            options["proxy"] = proxy
        
        # Add storage options
        options.update(self.storage.get_playwright_options())
        
        return options
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert profile to dictionary for serialization."""
        return asdict(self)
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ProfileConfig":
        """Create profile from dictionary."""
        # Handle nested dataclasses
        if "navigator" in data and isinstance(data["navigator"], dict):
            data["navigator"] = NavigatorConfig(**data["navigator"])
        if "screen" in data and isinstance(data["screen"], dict):
            data["screen"] = ScreenConfig(**data["screen"])
        if "locale" in data and isinstance(data["locale"], dict):
            data["locale"] = LocaleConfig(**data["locale"])
        if "webgl" in data and isinstance(data["webgl"], dict):
            data["webgl"] = WebGLConfig(**data["webgl"])
        if "proxy" in data and isinstance(data["proxy"], dict):
            data["proxy"] = ProxyConfig(**data["proxy"])
        if "webrtc" in data and isinstance(data["webrtc"], dict):
            data["webrtc"] = WebRTCConfig(**data["webrtc"])
        if "storage" in data and isinstance(data["storage"], dict):
            data["storage"] = StorageConfig(**data["storage"])
        
        return cls(**data)


class ProfileStorage:
    """
    Handles persistence of profiles as JSON files.
    
    Profiles are stored as individual JSON files in the profiles directory,
    with the filename being the profile ID.
    """
    
    def __init__(self, profiles_dir: Optional[Union[str, Path]] = None):
        """
        Initialize profile storage.
        
        Args:
            profiles_dir: Directory to store profiles. Defaults to `profiles/` in repo root.
        """
        if profiles_dir is None:
            self.profiles_dir = DEFAULT_PROFILES_DIR
        else:
            self.profiles_dir = Path(profiles_dir)
        
        # Ensure directory exists
        self.profiles_dir.mkdir(parents=True, exist_ok=True)
    
    def _profile_path(self, profile_id: str) -> Path:
        """Get the file path for a profile."""
        return self.profiles_dir / f"{profile_id}.json"
    
    def save(self, profile: ProfileConfig) -> None:
        """
        Save a profile to disk.
        
        Args:
            profile: The profile to save.
        """
        profile.touch()
        path = self._profile_path(profile.id)
        with open(path, "wb") as f:
            f.write(orjson.dumps(profile.to_dict(), option=orjson.OPT_INDENT_2))
    
    def load(self, profile_id: str) -> ProfileConfig:
        """
        Load a profile from disk.
        
        Args:
            profile_id: The ID of the profile to load.
            
        Returns:
            The loaded profile.
            
        Raises:
            FileNotFoundError: If the profile doesn't exist.
        """
        path = self._profile_path(profile_id)
        with open(path, "rb") as f:
            data = orjson.loads(f.read())
        return ProfileConfig.from_dict(data)
    
    def delete(self, profile_id: str) -> bool:
        """
        Delete a profile from disk.
        
        Args:
            profile_id: The ID of the profile to delete.
            
        Returns:
            True if deleted, False if not found.
        """
        path = self._profile_path(profile_id)
        if path.exists():
            path.unlink()
            return True
        return False
    
    def list_profiles(self) -> List[ProfileConfig]:
        """
        List all saved profiles.
        
        Returns:
            List of all profiles.
        """
        profiles = []
        for path in self.profiles_dir.glob("*.json"):
            try:
                with open(path, "rb") as f:
                    data = orjson.loads(f.read())
                profiles.append(ProfileConfig.from_dict(data))
            except (orjson.JSONDecodeError, TypeError, KeyError):
                # Skip invalid profile files
                continue
        return profiles
    
    def exists(self, profile_id: str) -> bool:
        """Check if a profile exists."""
        return self._profile_path(profile_id).exists()
    
    def get_profile_ids(self) -> List[str]:
        """Get list of all profile IDs."""
        return [p.stem for p in self.profiles_dir.glob("*.json")]


# Default storage instance
_default_storage: Optional[ProfileStorage] = None


def get_default_storage() -> ProfileStorage:
    """Get the default profile storage instance."""
    global _default_storage
    if _default_storage is None:
        _default_storage = ProfileStorage()
    return _default_storage


def save_profile(profile: ProfileConfig) -> None:
    """Save a profile to the default storage."""
    get_default_storage().save(profile)


def load_profile(profile_id: str) -> ProfileConfig:
    """Load a profile from the default storage."""
    return get_default_storage().load(profile_id)


def delete_profile(profile_id: str) -> bool:
    """Delete a profile from the default storage."""
    return get_default_storage().delete(profile_id)


def list_profiles() -> List[ProfileConfig]:
    """List all profiles from the default storage."""
    return get_default_storage().list_profiles()
