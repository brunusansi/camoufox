"""
Unit tests for Camoufox profile model, presets, and consistency checker.

Run with: pytest test_profiles.py -v
"""

import json
import tempfile
from pathlib import Path

import pytest

# Import from the camoufox module
import sys
sys.path.insert(0, str(Path(__file__).parent.parent / "pythonlib"))

from camoufox.profile import (
    LocaleConfig,
    NavigatorConfig,
    ProfileConfig,
    ProfileStorage,
    ProxyConfig,
    ScreenConfig,
    StorageConfig,
    WebGLConfig,
    WebRTCConfig,
)
from camoufox.presets import (
    AVAILABLE_PRESETS,
    get_linux_desktop_preset,
    get_macos_apple_silicon_preset,
    get_preset,
    get_preset_for_os,
    get_windows_10_preset,
    get_windows_11_preset,
    list_presets,
)
from camoufox.consistency import (
    ConsistencyLevel,
    enforce_os_consistency,
    get_consistency_summary,
    validate_profile,
)


class TestProfileConfig:
    """Tests for ProfileConfig dataclass."""

    def test_default_profile_creation(self):
        """Test creating a profile with default values."""
        profile = ProfileConfig()
        assert profile.id is not None
        assert profile.target_os == "windows"
        assert profile.browser_family == "firefox"
        assert profile.version == "1.0.0"

    def test_profile_with_custom_values(self):
        """Test creating a profile with custom values."""
        profile = ProfileConfig(
            name="Test Profile",
            target_os="macos",
            notes="This is a test",
        )
        assert profile.name == "Test Profile"
        assert profile.target_os == "macos"
        assert profile.notes == "This is a test"

    def test_profile_navigator_config(self):
        """Test navigator configuration."""
        nav = NavigatorConfig(
            user_agent="Test UA",
            platform="MacIntel",
            hardware_concurrency=8,
        )
        profile = ProfileConfig(navigator=nav)
        assert profile.navigator.user_agent == "Test UA"
        assert profile.navigator.platform == "MacIntel"

    def test_profile_to_dict(self):
        """Test profile serialization to dict."""
        profile = ProfileConfig(name="Test")
        data = profile.to_dict()
        assert isinstance(data, dict)
        assert data["name"] == "Test"
        assert "navigator" in data
        assert "screen" in data

    def test_profile_from_dict(self):
        """Test profile deserialization from dict."""
        data = {
            "name": "From Dict",
            "target_os": "linux",
            "navigator": {
                "user_agent": "Linux UA",
                "platform": "Linux x86_64",
                "hardware_concurrency": 4,
            },
            "screen": {
                "width": 1920,
                "height": 1080,
            },
        }
        profile = ProfileConfig.from_dict(data)
        assert profile.name == "From Dict"
        assert profile.target_os == "linux"
        assert profile.navigator.user_agent == "Linux UA"

    def test_profile_to_camoufox_config(self):
        """Test conversion to Camoufox config dict."""
        profile = ProfileConfig(
            navigator=NavigatorConfig(
                user_agent="Test UA",
                hardware_concurrency=8,
            ),
            screen=ScreenConfig(
                width=1920,
                height=1080,
            ),
        )
        config = profile.to_camoufox_config()
        assert config["navigator.hardwareConcurrency"] == 8
        assert config["screen.width"] == 1920


class TestProxyConfig:
    """Tests for ProxyConfig."""

    def test_none_proxy(self):
        """Test no proxy configuration."""
        proxy = ProxyConfig(type="none")
        assert proxy.to_playwright_proxy() is None

    def test_http_proxy(self):
        """Test HTTP proxy configuration."""
        proxy = ProxyConfig(
            type="http",
            server="http://proxy.example.com:8080",
            username="user",
            password="pass",
        )
        result = proxy.to_playwright_proxy()
        assert result is not None
        assert result["server"] == "http://proxy.example.com:8080"
        assert result["username"] == "user"


class TestWebRTCConfig:
    """Tests for WebRTCConfig."""

    def test_disabled_mode(self):
        """Test disabled WebRTC mode."""
        webrtc = WebRTCConfig(mode="disabled")
        prefs = webrtc.get_firefox_prefs()
        assert prefs["media.peerconnection.enabled"] is False

    def test_default_mode(self):
        """Test default WebRTC mode."""
        webrtc = WebRTCConfig(mode="default")
        prefs = webrtc.get_firefox_prefs()
        assert "media.peerconnection.enabled" not in prefs


class TestProfileStorage:
    """Tests for ProfileStorage."""

    def test_save_and_load_profile(self):
        """Test saving and loading a profile."""
        with tempfile.TemporaryDirectory() as tmpdir:
            storage = ProfileStorage(tmpdir)
            profile = ProfileConfig(name="Storage Test")
            
            storage.save(profile)
            loaded = storage.load(profile.id)
            
            assert loaded.name == "Storage Test"
            assert loaded.id == profile.id

    def test_list_profiles(self):
        """Test listing all profiles."""
        with tempfile.TemporaryDirectory() as tmpdir:
            storage = ProfileStorage(tmpdir)
            
            # Create and save multiple profiles
            profile1 = ProfileConfig(name="Profile 1")
            profile2 = ProfileConfig(name="Profile 2")
            storage.save(profile1)
            storage.save(profile2)
            
            profiles = storage.list_profiles()
            assert len(profiles) == 2
            names = [p.name for p in profiles]
            assert "Profile 1" in names
            assert "Profile 2" in names

    def test_delete_profile(self):
        """Test deleting a profile."""
        with tempfile.TemporaryDirectory() as tmpdir:
            storage = ProfileStorage(tmpdir)
            profile = ProfileConfig(name="To Delete")
            storage.save(profile)
            
            assert storage.exists(profile.id)
            storage.delete(profile.id)
            assert not storage.exists(profile.id)


class TestPresets:
    """Tests for fingerprint presets."""

    def test_get_macos_preset(self):
        """Test macOS Apple Silicon preset."""
        profile = get_macos_apple_silicon_preset()
        assert profile.target_os == "macos"
        assert profile.navigator.platform == "MacIntel"
        assert "Mac OS X" in profile.navigator.oscpu

    def test_get_macos_preset_retina_vs_standard(self):
        """Test macOS preset with and without Retina."""
        retina = get_macos_apple_silicon_preset(retina=True)
        standard = get_macos_apple_silicon_preset(retina=False)
        
        assert retina.screen.device_pixel_ratio == 2.0
        assert standard.screen.device_pixel_ratio == 1.0

    def test_get_windows_11_preset(self):
        """Test Windows 11 preset."""
        profile = get_windows_11_preset()
        assert profile.target_os == "windows"
        assert profile.navigator.platform == "Win32"
        assert "Windows NT" in profile.navigator.user_agent

    def test_get_windows_11_preset_gpu_types(self):
        """Test Windows 11 preset with different GPU types."""
        nvidia = get_windows_11_preset(gpu_type="nvidia")
        amd = get_windows_11_preset(gpu_type="amd")
        intel = get_windows_11_preset(gpu_type="intel")
        
        assert "NVIDIA" in nvidia.webgl.renderer
        assert "AMD" in amd.webgl.renderer
        assert "Intel" in intel.webgl.renderer

    def test_get_linux_preset(self):
        """Test Linux desktop preset."""
        profile = get_linux_desktop_preset()
        assert profile.target_os == "linux"
        assert "Linux" in profile.navigator.platform

    def test_get_preset_by_id(self):
        """Test getting preset by ID."""
        for preset_id in AVAILABLE_PRESETS:
            profile = get_preset(preset_id)
            assert profile is not None
            assert profile.name is not None

    def test_get_preset_invalid_id(self):
        """Test getting preset with invalid ID raises error."""
        with pytest.raises(ValueError) as exc_info:
            get_preset("invalid_preset_id")
        assert "Unknown preset" in str(exc_info.value)

    def test_get_preset_for_os(self):
        """Test getting default preset for each OS."""
        macos = get_preset_for_os("macos")
        windows = get_preset_for_os("windows")
        linux = get_preset_for_os("linux")
        
        assert macos.target_os == "macos"
        assert windows.target_os == "windows"
        assert linux.target_os == "linux"

    def test_list_presets(self):
        """Test listing all preset metadata."""
        presets = list_presets()
        assert len(presets) > 0
        for preset in presets:
            assert preset.id is not None
            assert preset.name is not None
            assert preset.target_os is not None


class TestConsistencyChecker:
    """Tests for profile consistency validation."""

    def test_valid_macos_profile(self):
        """Test that a properly configured macOS profile is valid."""
        profile = get_macos_apple_silicon_preset()
        report = validate_profile(profile)
        
        # Should be valid (no errors)
        assert report.is_valid
        assert report.error_count == 0

    def test_os_platform_mismatch(self):
        """Test detection of OS/platform mismatch."""
        profile = ProfileConfig(
            name="Mismatch",
            target_os="macos",
            navigator=NavigatorConfig(platform="Win32"),  # Wrong!
        )
        report = validate_profile(profile)
        
        assert not report.is_valid
        assert report.error_count > 0
        assert any(i.code == "OS_PLATFORM_MISMATCH" for i in report.issues)

    def test_os_oscpu_mismatch(self):
        """Test detection of OS/oscpu mismatch."""
        profile = ProfileConfig(
            name="Mismatch",
            target_os="macos",
            navigator=NavigatorConfig(
                platform="MacIntel",
                oscpu="Windows NT 10.0",  # Wrong!
            ),
        )
        report = validate_profile(profile)
        
        assert not report.is_valid
        assert any(i.code == "OS_OSCPU_MISMATCH" for i in report.issues)

    def test_webgl_os_mismatch(self):
        """Test detection of WebGL/OS mismatch."""
        profile = ProfileConfig(
            name="Mismatch",
            target_os="macos",
            webgl=WebGLConfig(
                enabled=True,
                vendor="Google Inc. (NVIDIA)",
                renderer="ANGLE (NVIDIA, Direct3D11)",  # Windows-style!
            ),
        )
        report = validate_profile(profile)
        
        assert any(i.code == "WEBGL_OS_MISMATCH" for i in report.issues)

    def test_webrtc_proxy_warning(self):
        """Test warning for WebRTC with proxy but default mode."""
        profile = ProfileConfig(
            name="Proxy Issue",
            proxy=ProxyConfig(type="http", server="http://proxy:8080"),
            webrtc=WebRTCConfig(mode="default"),  # Should be disabled!
        )
        report = validate_profile(profile)
        
        assert any(i.code == "WEBRTC_PROXY_LEAK" for i in report.issues)

    def test_macos_touch_warning(self):
        """Test warning for touch points on macOS."""
        profile = ProfileConfig(
            name="Touch Issue",
            target_os="macos",
            navigator=NavigatorConfig(
                platform="MacIntel",
                max_touch_points=10,  # Unusual for Mac
            ),
        )
        report = validate_profile(profile)
        
        assert any(i.code == "MACOS_TOUCH_UNUSUAL" for i in report.issues)

    def test_invalid_core_count(self):
        """Test error for invalid hardware concurrency."""
        profile = ProfileConfig(
            name="Invalid Cores",
            navigator=NavigatorConfig(hardware_concurrency=0),
        )
        report = validate_profile(profile)
        
        assert any(i.code == "INVALID_CORE_COUNT" for i in report.issues)

    def test_enforce_os_consistency(self):
        """Test automatic OS consistency enforcement."""
        profile = ProfileConfig(
            name="Enforce",
            target_os="macos",
        )
        # Initially empty
        assert profile.navigator.platform == ""
        
        enforce_os_consistency(profile)
        
        assert profile.navigator.platform == "MacIntel"
        assert "Mac OS X" in profile.navigator.oscpu

    def test_consistency_summary(self):
        """Test consistency summary for UI."""
        profile = ProfileConfig(
            name="Summary Test",
            target_os="macos",
            navigator=NavigatorConfig(platform="Win32"),  # Wrong
        )
        summary = get_consistency_summary(profile)
        
        assert summary["is_valid"] is False
        assert summary["error_count"] > 0
        assert "field_status" in summary
        assert "issues" in summary

    def test_report_human_readable(self):
        """Test human-readable report formatting."""
        profile = get_macos_apple_silicon_preset()
        report = validate_profile(profile)
        text = report.format_human_readable()
        
        assert "Consistency Report" in text
        assert profile.name in text


class TestIntegration:
    """Integration tests combining multiple components."""

    def test_preset_to_storage_roundtrip(self):
        """Test saving and loading a preset."""
        with tempfile.TemporaryDirectory() as tmpdir:
            storage = ProfileStorage(tmpdir)
            
            # Get a preset
            original = get_preset("macos_apple_silicon")
            original.name = "Integration Test"
            
            # Save and reload
            storage.save(original)
            loaded = storage.load(original.id)
            
            # Verify key properties preserved
            assert loaded.name == "Integration Test"
            assert loaded.target_os == "macos"
            assert loaded.navigator.platform == "MacIntel"
            assert loaded.screen.device_pixel_ratio == 2.0

    def test_preset_validation(self):
        """Test that all presets pass validation."""
        for preset_id in AVAILABLE_PRESETS:
            profile = get_preset(preset_id)
            report = validate_profile(profile)
            
            assert report.is_valid, f"Preset {preset_id} failed validation: {report.format_human_readable()}"

    def test_config_conversion_roundtrip(self):
        """Test profile to config and back."""
        original = get_preset("windows_11")
        
        # Convert to dict and back
        data = original.to_dict()
        restored = ProfileConfig.from_dict(data)
        
        # Verify key properties
        assert restored.target_os == original.target_os
        assert restored.navigator.platform == original.navigator.platform
        assert restored.screen.width == original.screen.width


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
