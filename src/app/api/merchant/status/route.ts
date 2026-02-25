import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, error: "Missing API key" },
        { status: 401 }
      );
    }

    const apiKey = authHeader.substring(7);

    // Validate API key and find merchant
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey, active: true },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            businessName: true,
            stripeConnected: true,
            stripeAccountId: true,
            plan: true,
            suspended: true,
          },
        },
      },
    });

    if (!keyRecord || !keyRecord.user) {
      return NextResponse.json(
        { success: false, error: "Invalid API key" },
        { status: 401 }
      );
    }

    if (keyRecord.user.suspended) {
      return NextResponse.json(
        { success: false, error: "Account suspended" },
        { status: 403 }
      );
    }

    // Update lastUsed
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsed: new Date() },
    });

    const user = keyRecord.user;

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
        publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      },
    });
  } catch (error: any) {
    console.error("Merchant status error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
