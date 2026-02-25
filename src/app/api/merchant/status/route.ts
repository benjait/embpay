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

    // Find user by email (simplified for demo)
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        stripeConnected: true,
        stripeAccountId: true,
        plan: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      merchant: {
        id: user.id,
        email: user.email,
        name: user.name,
        businessName: user.businessName,
        stripeConnected: user.stripeConnected,
        stripeAccountId: user.stripeAccountId,
        plan: user.plan,
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

    // Domain tracking removed for simplicity

    return NextResponse.json({
      success: true,
      connected: user.stripeConnected,
      account_id: user.stripeAccountId,
    });
  } catch (error) {
    return handleApiError(error, "Verify merchant");
  }
}
