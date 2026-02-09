import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import prisma from "@/lib/prisma";

const JWT_SECRET: string = process.env.NEXTAUTH_SECRET || "embpay-dev-secret-change-in-production";
const TOKEN_EXPIRY = "7d";

// Legacy JWT functions (for backward compatibility during migration)
export function signToken(userId: string): string {
  // With Supabase Auth, we don't use JWT tokens anymore
  // This function is kept for backward compatibility
  return "supabase-auth";
}

export function verifyToken(token: string): { userId: string } | null {
  // Legacy token verification - Supabase Auth handles this now
  return null;
}

// Main auth function - now uses Supabase Auth
export async function getAuthUser(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  // Get additional user data from our database
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      businessName: true,
      stripeAccountId: true,
      stripeConnected: true,
      commissionRate: true,
      createdAt: true,
    },
  });

  if (!dbUser) {
    // User exists in Supabase Auth but not in our DB yet
    // Create the user record
    return await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || null,
        businessName: user.user_metadata?.businessName || null,
        stripeConnected: user.user_metadata?.stripeConnected || false,
        stripeAccountId: user.user_metadata?.stripeAccountId || null,
        commissionRate: user.user_metadata?.commissionRate || 0.03,
      },
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        stripeAccountId: true,
        stripeConnected: true,
        commissionRate: true,
        createdAt: true,
      },
    });
  }

  return dbUser;
}

// Helper for requiring auth in API routes
export async function requireAuth(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  return user;
}
