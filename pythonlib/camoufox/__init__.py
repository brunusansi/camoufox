from .addons import DefaultAddons
from .async_api import AsyncCamoufox, AsyncNewBrowser
from .consistency import (
    ConsistencyIssue,
    ConsistencyLevel,
    ConsistencyReport,
    enforce_os_consistency,
    get_consistency_summary,
    validate_profile,
)
from .presets import (
    AVAILABLE_PRESETS,
    get_linux_desktop_preset,
    get_macos_apple_silicon_preset,
    get_preset,
    get_preset_for_os,
    get_windows_10_preset,
    get_windows_11_preset,
    list_presets,
)
from .profile import (
    LocaleConfig,
    NavigatorConfig,
    ProfileConfig,
    ProfileStorage,
    ProxyConfig,
    ScreenConfig,
    StorageConfig,
    WebGLConfig,
    WebRTCConfig,
    delete_profile,
    get_default_storage,
    list_profiles,
    load_profile,
    save_profile,
)
from .sync_api import Camoufox, NewBrowser
from .utils import launch_options

__all__ = [
    # Core API
    "Camoufox",
    "NewBrowser",
    "AsyncCamoufox",
    "AsyncNewBrowser",
    "DefaultAddons",
    "launch_options",
    # Profile model
    "ProfileConfig",
    "ProfileStorage",
    "NavigatorConfig",
    "ScreenConfig",
    "LocaleConfig",
    "WebGLConfig",
    "ProxyConfig",
    "WebRTCConfig",
    "StorageConfig",
    # Profile operations
    "save_profile",
    "load_profile",
    "delete_profile",
    "list_profiles",
    "get_default_storage",
    # Presets
    "get_preset",
    "get_preset_for_os",
    "list_presets",
    "get_macos_apple_silicon_preset",
    "get_windows_11_preset",
    "get_windows_10_preset",
    "get_linux_desktop_preset",
    "AVAILABLE_PRESETS",
    # Consistency
    "validate_profile",
    "enforce_os_consistency",
    "get_consistency_summary",
    "ConsistencyReport",
    "ConsistencyIssue",
    "ConsistencyLevel",
]
