import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { handleApiError } from "@/lib/errors";
import { isValidEmail, isValidString, sanitizeString } from "@/lib/validation";

// GET — Get current user settings
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get fresh user data from database
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        stripeConnected: true,
        stripeAccountId: true,
        commissionRate: true,
      },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        businessName: dbUser.businessName,
        stripeConnected: dbUser.stripeConnected,
        stripeAccountId: dbUser.stripeAccountId,
        commissionRate: dbUser.commissionRate,
      },
    });
  } catch (error) {
    return handleApiError(error, "Get settings");
  }
}

// PUT — Update user settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, businessName, logoUrl, accentColor } = body;

    // Validate email if provided
    if (email !== undefined && !isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Validate name if provided
    if (name !== undefined && !isValidString(name, { maxLength: 200 })) {
      return NextResponse.json(
        { success: false, error: "Name must be 200 characters or less" },
        { status: 400 }
      );
    }

    // Validate business name if provided
    if (businessName !== undefined && !isValidString(businessName, { maxLength: 200 })) {
      return NextResponse.json(
        { success: false, error: "Business name must be 200 characters or less" },
        { status: 400 }
      );
    }

    // Update user in database
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name: sanitizeString(name, 200) || null }),
        ...(email !== undefined && { email: email.toLowerCase().trim() }),
        ...(businessName !== undefined && { businessName: sanitizeString(businessName, 200) || null }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        businessName: true,
        stripeConnected: true,
        stripeAccountId: true,
        commissionRate: true,
      },
    });

    // Note: logoUrl and accentColor are UI-only settings for now
    // They could be stored in a separate settings table in the future

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        businessName: updatedUser.businessName,
        stripeConnected: updatedUser.stripeConnected,
        stripeAccountId: updatedUser.stripeAccountId,
        commissionRate: updatedUser.commissionRate,
        logoUrl: logoUrl || "",
        accentColor: accentColor || "#6366f1",
      },
    });
  } catch (error) {
    return handleApiError(error, "Update settings");
  }
}
