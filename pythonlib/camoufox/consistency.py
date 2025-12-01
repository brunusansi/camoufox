"""
Profile consistency validation for Camoufox.

This module provides:
- Validation of profile internal consistency
- Detection of fingerprint contradictions
- Warnings and hints for potential issues
"""

from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

from .profile import ProfileConfig


class ConsistencyLevel(Enum):
    """Severity level of a consistency issue."""
    
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


@dataclass
class ConsistencyIssue:
    """Represents a single consistency issue in a profile."""
    
    level: ConsistencyLevel
    code: str
    message: str
    field: str
    suggestion: str = ""
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "level": self.level.value,
            "code": self.code,
            "message": self.message,
            "field": self.field,
            "suggestion": self.suggestion,
        }


@dataclass
class ConsistencyReport:
    """Report containing all consistency issues for a profile."""
    
    profile_id: str
    profile_name: str
    is_valid: bool
    issues: List[ConsistencyIssue] = field(default_factory=list)
    
    @property
    def error_count(self) -> int:
        """Count of error-level issues."""
        return sum(1 for i in self.issues if i.level == ConsistencyLevel.ERROR)
    
    @property
    def warning_count(self) -> int:
        """Count of warning-level issues."""
        return sum(1 for i in self.issues if i.level == ConsistencyLevel.WARNING)
    
    @property
    def info_count(self) -> int:
        """Count of info-level issues."""
        return sum(1 for i in self.issues if i.level == ConsistencyLevel.INFO)
    
    def has_errors(self) -> bool:
        """Check if report has any errors."""
        return self.error_count > 0
    
    def has_warnings(self) -> bool:
        """Check if report has any warnings."""
        return self.warning_count > 0
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization."""
        return {
            "profile_id": self.profile_id,
            "profile_name": self.profile_name,
            "is_valid": self.is_valid,
            "error_count": self.error_count,
            "warning_count": self.warning_count,
            "info_count": self.info_count,
            "issues": [i.to_dict() for i in self.issues],
        }
    
    def format_human_readable(self) -> str:
        """Format report as human-readable text."""
        lines = [
            f"Consistency Report for: {self.profile_name}",
            f"Profile ID: {self.profile_id}",
            f"Status: {'VALID' if self.is_valid else 'INVALID'}",
            f"Issues: {self.error_count} errors, {self.warning_count} warnings, {self.info_count} info",
            "",
        ]
        
        if not self.issues:
            lines.append("No issues found. Profile is internally consistent.")
        else:
            for issue in self.issues:
                icon = {
                    ConsistencyLevel.ERROR: "❌",
                    ConsistencyLevel.WARNING: "⚠️",
                    ConsistencyLevel.INFO: "ℹ️",
                }[issue.level]
                lines.append(f"{icon} [{issue.code}] {issue.message}")
                lines.append(f"   Field: {issue.field}")
                if issue.suggestion:
                    lines.append(f"   Suggestion: {issue.suggestion}")
                lines.append("")
        
        return "\n".join(lines)


# ============================================================================
# OS-specific expected values
# ============================================================================

OS_PLATFORM_MAP = {
    "macos": ["MacIntel", "MacPPC", "Mac68K"],
    "windows": ["Win32", "Win64"],
    "linux": ["Linux x86_64", "Linux i686", "Linux armv7l", "Linux aarch64"],
}

OS_OSCPU_PATTERNS = {
    "macos": ["Intel Mac OS X", "Mac OS X"],
    "windows": ["Windows NT"],
    "linux": ["Linux"],
}

OS_UA_PATTERNS = {
    "macos": ["Macintosh", "Mac OS X"],
    "windows": ["Windows NT"],
    "linux": ["Linux", "X11"],
}

# Timezone regions typically associated with each locale region
REGION_TIMEZONE_MAP = {
    "US": ["America/"],
    "GB": ["Europe/London"],
    "DE": ["Europe/Berlin"],
    "FR": ["Europe/Paris"],
    "JP": ["Asia/Tokyo"],
    "CN": ["Asia/Shanghai", "Asia/Beijing"],
    "AU": ["Australia/"],
    "BR": ["America/Sao_Paulo"],
    "CA": ["America/Toronto", "America/Vancouver"],
}

# Common device pixel ratios for each OS
OS_DPR_RANGES = {
    "macos": [(1.0, 1.0), (2.0, 2.0)],  # Standard or Retina
    "windows": [(1.0, 2.0)],  # 100% to 200% scaling
    "linux": [(1.0, 2.0)],
}


# ============================================================================
# Consistency checks
# ============================================================================

def check_os_platform_consistency(profile: ProfileConfig) -> Optional[ConsistencyIssue]:
    """Check if navigator.platform matches target OS."""
    expected_platforms = OS_PLATFORM_MAP.get(profile.target_os, [])
    actual_platform = profile.navigator.platform
    
    if actual_platform and actual_platform not in expected_platforms:
        return ConsistencyIssue(
            level=ConsistencyLevel.ERROR,
            code="OS_PLATFORM_MISMATCH",
            message=f"Platform '{actual_platform}' does not match target OS '{profile.target_os}'",
            field="navigator.platform",
            suggestion=f"Use one of: {', '.join(expected_platforms)}",
        )
    return None


def check_os_oscpu_consistency(profile: ProfileConfig) -> Optional[ConsistencyIssue]:
    """Check if navigator.oscpu matches target OS."""
    expected_patterns = OS_OSCPU_PATTERNS.get(profile.target_os, [])
    actual_oscpu = profile.navigator.oscpu
    
    if actual_oscpu:
        matches = any(pattern in actual_oscpu for pattern in expected_patterns)
        if not matches:
            return ConsistencyIssue(
                level=ConsistencyLevel.ERROR,
                code="OS_OSCPU_MISMATCH",
                message=f"oscpu '{actual_oscpu}' does not match target OS '{profile.target_os}'",
                field="navigator.oscpu",
                suggestion=f"oscpu should contain one of: {', '.join(expected_patterns)}",
            )
    return None


def check_os_useragent_consistency(profile: ProfileConfig) -> Optional[ConsistencyIssue]:
    """Check if User-Agent matches target OS."""
    expected_patterns = OS_UA_PATTERNS.get(profile.target_os, [])
    actual_ua = profile.navigator.user_agent
    
    if actual_ua:
        matches = any(pattern in actual_ua for pattern in expected_patterns)
        if not matches:
            return ConsistencyIssue(
                level=ConsistencyLevel.ERROR,
                code="OS_UA_MISMATCH",
                message=f"User-Agent does not contain expected patterns for '{profile.target_os}'",
                field="navigator.user_agent",
                suggestion=f"User-Agent should contain one of: {', '.join(expected_patterns)}",
            )
    return None


def check_timezone_locale_consistency(profile: ProfileConfig) -> Optional[ConsistencyIssue]:
    """Check if timezone reasonably matches locale region."""
    region = profile.locale.region
    timezone = profile.locale.timezone
    
    expected_prefixes = REGION_TIMEZONE_MAP.get(region)
    
    if expected_prefixes and timezone:
        matches = any(timezone.startswith(prefix) for prefix in expected_prefixes)
        if not matches:
            return ConsistencyIssue(
                level=ConsistencyLevel.WARNING,
                code="TIMEZONE_REGION_MISMATCH",
                message=f"Timezone '{timezone}' may not match region '{region}'",
                field="locale.timezone",
                suggestion=f"Consider using a timezone starting with: {', '.join(expected_prefixes)}",
            )
    return None


def check_screen_dpr_consistency(profile: ProfileConfig) -> Optional[ConsistencyIssue]:
    """Check if device pixel ratio is reasonable for target OS."""
    target_os = profile.target_os
    dpr = profile.screen.device_pixel_ratio
    
    # macOS specific check for Retina
    if target_os == "macos" and dpr not in [1.0, 2.0]:
        return ConsistencyIssue(
            level=ConsistencyLevel.WARNING,
            code="MACOS_DPR_UNUSUAL",
            message=f"Device pixel ratio {dpr} is unusual for macOS",
            field="screen.device_pixel_ratio",
            suggestion="macOS typically uses 1.0 (standard) or 2.0 (Retina)",
        )
    
    # Windows specific check
    if target_os == "windows" and dpr not in [1.0, 1.25, 1.5, 1.75, 2.0]:
        return ConsistencyIssue(
            level=ConsistencyLevel.INFO,
            code="WINDOWS_DPR_UNUSUAL",
            message=f"Device pixel ratio {dpr} is unusual for Windows",
            field="screen.device_pixel_ratio",
            suggestion="Windows typically uses 1.0, 1.25, 1.5, 1.75, or 2.0",
        )
    
    return None


def check_webgl_os_consistency(profile: ProfileConfig) -> Optional[ConsistencyIssue]:
    """Check if WebGL vendor/renderer is consistent with target OS."""
    if not profile.webgl.enabled:
        return None
    
    vendor = profile.webgl.vendor.lower()
    renderer = profile.webgl.renderer.lower()
    target_os = profile.target_os
    
    # Check for obvious mismatches using more specific patterns
    # Direct3D is Windows-specific, ANGLE is typically used with Direct3D on Windows
    if target_os == "macos":
        # Check for Direct3D which is Windows-specific
        has_direct3d = "direct3d" in renderer or "d3d" in renderer
        # ANGLE in vendor suggests Windows (ANGLE wraps Direct3D)
        has_angle_vendor = vendor.startswith("google inc") and "angle" in renderer
        if has_direct3d or has_angle_vendor:
            return ConsistencyIssue(
                level=ConsistencyLevel.ERROR,
                code="WEBGL_OS_MISMATCH",
                message="Direct3D/ANGLE renderer detected with macOS target",
                field="webgl.renderer",
                suggestion="macOS typically uses Apple GPU or OpenGL renderers",
            )
    
    if target_os == "windows":
        # Check for Apple GPU which is macOS-specific
        is_apple_vendor = vendor.startswith("apple")
        is_apple_renderer = renderer.startswith("apple")
        if is_apple_vendor and is_apple_renderer:
            return ConsistencyIssue(
                level=ConsistencyLevel.ERROR,
                code="WEBGL_OS_MISMATCH",
                message="Apple renderer detected with Windows target",
                field="webgl.renderer",
                suggestion="Windows typically uses ANGLE (Direct3D) or native GPU renderers",
            )
    
    if target_os == "linux":
        # Direct3D is Windows-specific
        has_direct3d = "direct3d" in renderer or "d3d" in renderer
        if has_direct3d:
            return ConsistencyIssue(
                level=ConsistencyLevel.ERROR,
                code="WEBGL_OS_MISMATCH",
                message="Direct3D renderer detected with Linux target",
                field="webgl.renderer",
                suggestion="Linux typically uses Mesa or native OpenGL renderers",
            )
    
    return None


def check_touch_macos_consistency(profile: ProfileConfig) -> Optional[ConsistencyIssue]:
    """Check touch points for macOS (should typically be 0)."""
    if profile.target_os == "macos" and profile.navigator.max_touch_points > 0:
        return ConsistencyIssue(
            level=ConsistencyLevel.WARNING,
            code="MACOS_TOUCH_UNUSUAL",
            message=f"maxTouchPoints={profile.navigator.max_touch_points} is unusual for macOS",
            field="navigator.max_touch_points",
            suggestion="macOS devices typically report 0 touch points",
        )
    return None


def check_webrtc_proxy_consistency(profile: ProfileConfig) -> Optional[ConsistencyIssue]:
    """Check WebRTC configuration with proxy settings."""
    has_proxy = profile.proxy.type != "none" and profile.proxy.server
    webrtc_mode = profile.webrtc.mode
    
    if has_proxy and webrtc_mode == "default":
        return ConsistencyIssue(
            level=ConsistencyLevel.WARNING,
            code="WEBRTC_PROXY_LEAK",
            message="WebRTC is enabled with proxy but mode is 'default'",
            field="webrtc.mode",
            suggestion="Consider setting webrtc.mode to 'disabled' or 'proxy_only' to prevent IP leaks",
        )
    return None


def check_color_depth_consistency(profile: ProfileConfig) -> Optional[ConsistencyIssue]:
    """Check color depth is reasonable."""
    color_depth = profile.screen.color_depth
    
    if color_depth not in [24, 30, 32]:
        return ConsistencyIssue(
            level=ConsistencyLevel.INFO,
            code="COLOR_DEPTH_UNUSUAL",
            message=f"Color depth {color_depth} is unusual",
            field="screen.color_depth",
            suggestion="Common values are 24, 30, or 32 bits",
        )
    return None


def check_hardware_concurrency(profile: ProfileConfig) -> Optional[ConsistencyIssue]:
    """Check hardware concurrency is reasonable."""
    cores = profile.navigator.hardware_concurrency
    
    if cores < 1:
        return ConsistencyIssue(
            level=ConsistencyLevel.ERROR,
            code="INVALID_CORE_COUNT",
            message="Hardware concurrency must be at least 1",
            field="navigator.hardware_concurrency",
            suggestion="Set to a value between 2 and 16",
        )
    
    if cores > 64:
        return ConsistencyIssue(
            level=ConsistencyLevel.WARNING,
            code="HIGH_CORE_COUNT",
            message=f"Hardware concurrency {cores} is unusually high",
            field="navigator.hardware_concurrency",
            suggestion="Most consumer devices have 2-16 cores",
        )
    
    return None


def check_screen_dimensions(profile: ProfileConfig) -> Optional[ConsistencyIssue]:
    """Check screen dimensions are reasonable."""
    width = profile.screen.width
    height = profile.screen.height
    avail_width = profile.screen.avail_width
    avail_height = profile.screen.avail_height
    
    if width < 800 or height < 600:
        return ConsistencyIssue(
            level=ConsistencyLevel.WARNING,
            code="SMALL_SCREEN",
            message=f"Screen resolution {width}x{height} is very small",
            field="screen.width/height",
            suggestion="Most desktop browsers use at least 1280x720",
        )
    
    if avail_width > width or avail_height > height:
        return ConsistencyIssue(
            level=ConsistencyLevel.ERROR,
            code="INVALID_AVAIL_DIMENSIONS",
            message="Available dimensions exceed total screen dimensions",
            field="screen.availWidth/availHeight",
            suggestion="Available dimensions must be less than or equal to total dimensions",
        )
    
    return None


# ============================================================================
# Main validation function
# ============================================================================

def validate_profile(profile: ProfileConfig) -> ConsistencyReport:
    """
    Validate a profile for internal consistency.
    
    Runs all consistency checks and returns a report with any issues found.
    
    Args:
        profile: The profile to validate.
    
    Returns:
        ConsistencyReport with all issues found.
    
    Example:
        >>> profile = ProfileConfig(target_os="macos")
        >>> report = validate_profile(profile)
        >>> if report.has_errors():
        ...     print(report.format_human_readable())
    """
    issues: List[ConsistencyIssue] = []
    
    # Run all checks
    checks = [
        check_os_platform_consistency,
        check_os_oscpu_consistency,
        check_os_useragent_consistency,
        check_timezone_locale_consistency,
        check_screen_dpr_consistency,
        check_webgl_os_consistency,
        check_touch_macos_consistency,
        check_webrtc_proxy_consistency,
        check_color_depth_consistency,
        check_hardware_concurrency,
        check_screen_dimensions,
    ]
    
    for check in checks:
        issue = check(profile)
        if issue:
            issues.append(issue)
    
    # Profile is valid if there are no errors
    is_valid = not any(i.level == ConsistencyLevel.ERROR for i in issues)
    
    return ConsistencyReport(
        profile_id=profile.id,
        profile_name=profile.name,
        is_valid=is_valid,
        issues=issues,
    )


def enforce_os_consistency(profile: ProfileConfig) -> ProfileConfig:
    """
    Automatically fix obvious OS inconsistencies in a profile.
    
    This function updates navigator fields to match the target OS
    if they are not already set.
    
    Args:
        profile: The profile to fix.
    
    Returns:
        The modified profile (same object, mutated).
    """
    os_defaults = {
        "macos": {
            "platform": "MacIntel",
            "oscpu": "Intel Mac OS X 10.15",
            "ua_pattern": "Macintosh; Intel Mac OS X 10.15",
        },
        "windows": {
            "platform": "Win32",
            "oscpu": "Windows NT 10.0; Win64; x64",
            "ua_pattern": "Windows NT 10.0; Win64; x64",
        },
        "linux": {
            "platform": "Linux x86_64",
            "oscpu": "Linux x86_64",
            "ua_pattern": "X11; Linux x86_64",
        },
    }
    
    defaults = os_defaults.get(profile.target_os, {})
    
    # Set platform if not set
    if not profile.navigator.platform:
        profile.navigator.platform = defaults.get("platform", "")
    
    # Set oscpu if not set
    if not profile.navigator.oscpu:
        profile.navigator.oscpu = defaults.get("oscpu", "")
    
    return profile


def get_consistency_summary(profile: ProfileConfig) -> Dict[str, Any]:
    """
    Get a summary of profile consistency for UI display.
    
    Returns a simplified dictionary suitable for rendering in UI.
    """
    report = validate_profile(profile)
    
    # Group issues by field
    field_status: Dict[str, str] = {}
    for issue in report.issues:
        current = field_status.get(issue.field)
        if current is None or issue.level == ConsistencyLevel.ERROR:
            field_status[issue.field] = issue.level.value
    
    return {
        "is_valid": report.is_valid,
        "error_count": report.error_count,
        "warning_count": report.warning_count,
        "field_status": field_status,
        "issues": [
            {
                "level": i.level.value,
                "message": i.message,
                "suggestion": i.suggestion,
            }
            for i in report.issues
        ],
    }
