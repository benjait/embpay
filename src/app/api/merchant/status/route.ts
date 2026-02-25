import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";

// GET — Auth: get merchant status
// Used by WordPress plugin to verify API key
export async function GET(request: NextRequest) {
  try {
    // Get API key from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);

    // Find user by API key
    // Note: In production, you should hash API keys and compare hashes
    const user = await prisma.user.findFirst({
      where: {
        licenseKey: apiKey,
      },
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        stripeConnected: true,
        stripeAccountId: true,
        licenseTier: true,
        licenseExpiresAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Check if license is expired
    const isExpired = user.licenseExpiresAt && new Date(user.licenseExpiresAt) < new Date();

    return NextResponse.json({
      success: true,
      merchant: {
        id: user.id,
        email: user.email,
        name: user.name,
        businessName: user.businessName,
        stripeConnected: user.stripeConnected,
        stripeAccountId: user.stripeAccountId,
        licenseTier: user.licenseTier,
        licenseActive: !isExpired,
        licenseExpiresAt: user.licenseExpiresAt,
      },
    });
  } catch (error) {
    return handleApiError(error, "Get merchant status");
  }
}

// POST — Auth: verify merchant connection
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);
    const body = await request.json();
    const { stripe_account_id, domain } = body;

    const user = await prisma.user.findFirst({
      where: {
        licenseKey: apiKey,
      },
      select: {
        id: true,
        stripeAccountId: true,
        stripeConnected: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 }
      );
    }

    // Verify the stripe_account_id matches
    if (user.stripeAccountId !== stripe_account_id) {
      return NextResponse.json(
        { success: false, error: "Account mismatch" },
        { status: 403 }
      );
    }

    // Update domain if provided
    if (domain) {
      await prisma.user.update({
        where: { id: user.id },
        data: { website: domain },
      });
    }

    return NextResponse.json({
      success: true,
      connected: user.stripeConnected,
      account_id: user.stripeAccountId,
    });
  } catch (error) {
    return handleApiError(error, "Verify merchant");
  }
}
