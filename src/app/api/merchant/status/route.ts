import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);

    // Find user (simplified - in production, validate against API keys table)
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
