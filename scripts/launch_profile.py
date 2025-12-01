#!/usr/bin/env python3
"""
Profile Launcher Script for Camoufox UI

This script launches Camoufox with a profile loaded from a JSON file.
It is designed to be called by the UI's API route to start browsers.

Usage:
    python3 scripts/launch_profile.py --profile path/to/profile.json
    python3 scripts/launch_profile.py --profile-id <uuid>

SEGURANÇA: Este script é destinado APENAS para uso local.
NÃO execute em ambientes expostos à internet.
"""

import argparse
import os
import sys
from pathlib import Path

# Add pythonlib to path for imports
SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
PYTHONLIB_DIR = REPO_ROOT / "pythonlib"

if str(PYTHONLIB_DIR) not in sys.path:
    sys.path.insert(0, str(PYTHONLIB_DIR))

try:
    from camoufox import Camoufox
    from camoufox.profile import ProfileConfig, ProfileStorage, load_profile
except ImportError as e:
    print(f"Erro: Não foi possível importar camoufox. {e}")
    print("Certifique-se de que as dependências estão instaladas:")
    print("  cd pythonlib && pip install -e .")
    sys.exit(1)


def launch_browser_with_profile(profile: ProfileConfig) -> None:
    """
    Launch Camoufox browser with the given profile configuration.
    
    Args:
        profile: The ProfileConfig to use for launching the browser.
    """
    # Convert profile to Camoufox config
    config = profile.to_camoufox_config()
    
    # Get Firefox user preferences from profile
    firefox_user_prefs = profile.get_firefox_prefs()
    
    # Get Playwright options (proxy, storage, etc.)
    playwright_options = profile.get_playwright_options()
    
    # Determine if we should use a persistent context
    use_persistent = bool(profile.storage.user_data_dir)
    
    print(f"Iniciando Camoufox com perfil: {profile.name}")
    print(f"  OS alvo: {profile.target_os}")
    print(f"  User-Agent: {profile.navigator.user_agent[:80]}...")
    
    # Launch the browser
    # Using headful mode (headless=False) for UI-launched browsers
    with Camoufox(
        config=config,
        firefox_user_prefs=firefox_user_prefs if firefox_user_prefs else None,
        proxy=playwright_options.get("proxy"),
        headless=False,
        persistent_context=use_persistent,
        #user_data_dir=profile.storage.user_data_dir if use_persistent else None,
    ) as browser:
        # Create a new page (or use the existing one in persistent context)
        if use_persistent:
            # In persistent context mode, browser is actually a BrowserContext
            page = browser.new_page() if not browser.pages else browser.pages[0]
        else:
            # In regular mode, browser is a Browser
            context = browser.new_context()
            page = context.new_page()
        
        # Navigate to startup URL if configured
        if profile.startup_url:
            page.goto(profile.startup_url)
        else:
            # Default to about:blank or a nice start page
            page.goto("about:blank")
        
        print("Navegador iniciado. Pressione Ctrl+C para fechar.")
        
        # Keep the browser open until user closes it
        try:
            # Wait for browser to be closed by user
            # Using a loop with short timeouts to allow for graceful shutdown
            while True:
                try:
                    # Check if page is still connected every 30 seconds
                    page.wait_for_timeout(30000)  # 30 seconds
                except Exception:
                    # Page/browser was closed
                    break
        except KeyboardInterrupt:
            print("\nEncerrando navegador...")


def main():
    parser = argparse.ArgumentParser(
        description="Inicia o Camoufox com um perfil de configuração.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemplos:
  python3 scripts/launch_profile.py --profile profiles/abc123.json
  python3 scripts/launch_profile.py --profile-id abc123-def456-...

NOTA: Este script é para uso local apenas. Não exponha para a internet.
        """
    )
    
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--profile", "-p",
        type=str,
        help="Caminho para o arquivo JSON do perfil"
    )
    group.add_argument(
        "--profile-id", "-i",
        type=str,
        help="ID do perfil (carrega de profiles/<id>.json)"
    )
    
    parser.add_argument(
        "--profiles-dir", "-d",
        type=str,
        default=None,
        help="Diretório de perfis (padrão: profiles/ na raiz do repo)"
    )
    
    args = parser.parse_args()
    
    profile: ProfileConfig
    
    if args.profile:
        # Load from specific file path
        profile_path = Path(args.profile)
        if not profile_path.exists():
            print(f"Erro: Arquivo de perfil não encontrado: {profile_path}")
            sys.exit(1)
        
        import orjson
        with open(profile_path, "rb") as f:
            data = orjson.loads(f.read())
        profile = ProfileConfig.from_dict(data)
        
    else:
        # Load by profile ID
        storage = ProfileStorage(args.profiles_dir) if args.profiles_dir else ProfileStorage()
        
        try:
            profile = storage.load(args.profile_id)
        except FileNotFoundError:
            print(f"Erro: Perfil não encontrado: {args.profile_id}")
            sys.exit(1)
    
    # Launch the browser
    launch_browser_with_profile(profile)


if __name__ == "__main__":
    main()
