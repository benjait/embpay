import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * Debug endpoint: Check admin auth status
 * GET /api/admin/check
 */
export async function GET(request: NextRequest) {
  try {
    // Step 1: Check auth
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({
        step: "auth",
        error: "Not authenticated — no Supabase session found",
        authUser: null,
      });
    }

    // Step 2: Find user in DB
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: authUser.id },
        select: { id: true, email: true, name: true, role: true },
      });
    } catch (dbError: any) {
      return NextResponse.json({
        step: "db_query",
        error: `Database query failed: ${dbError.message}`,
        authUser: { id: authUser.id, email: authUser.email },
      });
    }

    if (!user) {
      return NextResponse.json({
        step: "user_not_found",
        error: "Auth user exists but no User row in database",
        authUser: { id: authUser.id, email: authUser.email },
      });
    }

    // Step 3: Check role
    const isAdmin = user.role === "admin" || user.role === "superadmin";

    return NextResponse.json({
      step: "complete",
      success: isAdmin,
      authUser: { id: authUser.id, email: authUser.email },
      dbUser: user,
      isAdmin,
      message: isAdmin
        ? `✅ You are ${user.role} — admin access granted`
        : `❌ Your role is "${user.role}" — need "admin" or "superadmin"`,
    });
  } catch (error: any) {
    return NextResponse.json({
      step: "error",
      error: error.message,
      stack: error.stack?.split("\n").slice(0, 3),
    });
  }
}
