/**
 * API Route: GET/POST /api/profiles
 *
 * GET: Lista todos os perfis salvos em disco.
 * POST: Cria um novo perfil.
 *
 * SEGURANÇA: Esta API é destinada APENAS para uso local (localhost).
 * NÃO exponha para a internet.
 */

import { NextRequest, NextResponse } from "next/server";
import { listProfiles, saveProfile } from "@/lib/profile-storage";
import type { ProfileConfig } from "@/lib/profile-types";

/**
 * GET /api/profiles
 * Retorna a lista de todos os perfis.
 */
export async function GET() {
  try {
    const profiles = await listProfiles();
    return NextResponse.json({
      success: true,
      profiles,
    });
  } catch (error) {
    console.error("Erro ao listar perfis:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao listar perfis",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/profiles
 * Cria um novo perfil.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Corpo da requisição inválido",
        },
        { status: 400 }
      );
    }

    // Save the profile (sanitization happens in saveProfile)
    const profile: ProfileConfig = await saveProfile(body);

    return NextResponse.json(
      {
        success: true,
        profile,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar perfil:", error);
    const message = error instanceof Error ? error.message : "Erro ao criar perfil";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
