/**
 * API Route: POST /api/profiles/[id]/run
 *
 * Inicia o Camoufox com o perfil especificado.
 *
 * SEGURANÇA: Esta API é destinada APENAS para uso local (localhost).
 * NÃO exponha para a internet. Este endpoint executa comandos no sistema.
 */

import { NextRequest, NextResponse } from "next/server";
import { loadProfile, getProfilesDir } from "@/lib/profile-storage";
import { spawn } from "child_process";
import path from "path";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/profiles/[id]/run
 * Inicia o Camoufox com o perfil especificado.
 *
 * O navegador é iniciado em modo headful (com interface gráfica).
 * O processo é "fire and forget" - não bloqueia a requisição HTTP.
 */
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ID do perfil é obrigatório",
        },
        { status: 400 }
      );
    }

    // Load the profile to verify it exists
    const profile = await loadProfile(id);

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Perfil não encontrado",
        },
        { status: 404 }
      );
    }

    // Get the profile path
    const profilePath = path.join(getProfilesDir(), `${id}.json`);

    // Get the launcher script path (relative to ui/ -> scripts/)
    const repoRoot = path.resolve(process.cwd(), "..");
    const launcherScript = path.join(repoRoot, "scripts", "launch_profile.py");

    // Determine Python command - can be overridden via environment variable
    const pythonCmd = process.env.PYTHON_CMD || 
      (process.platform === "win32" ? "python" : "python3");

    // Spawn the Python launcher script
    // This runs in the background and doesn't block the HTTP response
    // Using 'pipe' for stderr to enable potential error logging while keeping the process detached
    const child = spawn(pythonCmd, [launcherScript, "--profile", profilePath], {
      cwd: repoRoot,
      detached: true,
      stdio: ["ignore", "ignore", "pipe"],
      // Environment variables to help the script find dependencies
      env: {
        ...process.env,
        PYTHONPATH: path.join(repoRoot, "pythonlib"),
      },
    });

    // Log any stderr output for debugging (non-blocking)
    if (child.stderr) {
      child.stderr.on("data", (data) => {
        console.error(`[launch_profile.py] ${data}`);
      });
    }

    // Detach the child process so it continues running after this process exits
    child.unref();

    // Get PID for response (may be undefined on some platforms)
    const pid = child.pid;

    return NextResponse.json({
      success: true,
      message: `Camoufox iniciado com perfil "${profile.name}"`,
      pid,
    });
  } catch (error) {
    console.error("Erro ao iniciar Camoufox:", error);
    const message = error instanceof Error ? error.message : "Erro ao iniciar Camoufox";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
