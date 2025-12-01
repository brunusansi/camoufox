/**
 * API Route: GET/DELETE /api/profiles/[id]
 *
 * GET: Retorna um perfil específico.
 * DELETE: Deleta um perfil.
 *
 * SEGURANÇA: Esta API é destinada APENAS para uso local (localhost).
 * NÃO exponha para a internet.
 */

import { NextRequest, NextResponse } from "next/server";
import { loadProfile, deleteProfile } from "@/lib/profile-storage";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/profiles/[id]
 * Retorna um perfil específico pelo ID.
 */
export async function GET(
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

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Erro ao carregar perfil:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao carregar perfil",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/profiles/[id]
 * Deleta um perfil específico.
 */
export async function DELETE(
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

    const deleted = await deleteProfile(id);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Perfil não encontrado",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Perfil deletado com sucesso",
    });
  } catch (error) {
    console.error("Erro ao deletar perfil:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Erro ao deletar perfil",
      },
      { status: 500 }
    );
  }
}
