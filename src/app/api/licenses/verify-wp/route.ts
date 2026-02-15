import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * WordPress Plugin License Verification
 * 
 * POST /api/licenses/verify-wp
 * Body: { key: string, domain: string }
 * 
 * Returns tier-based license info for WordPress plugin
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, domain } = body;

    if (!key) {
      return NextResponse.json(
        { valid: false, error: "missing_key" },
        { status: 400, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Find license key
    const license = await prisma.licenseKey.findUnique({
      where: { key },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            tier: true,
            products: {
              where: { isProduction: true },
              select: {
                id: true,
                name: true,
                type: true,
                isProduction: true,
              },
              take: 50,
            },
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!license) {
      return NextResponse.json(
        { valid: false, error: "license_not_found" },
        { status: 404, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Check license status
    if (license.status === "revoked") {
      return NextResponse.json(
        { valid: false, error: "license_revoked" },
        { status: 403, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    if (license.status === "suspended") {
      return NextResponse.json(
        { valid: false, error: "license_suspended" },
        { status: 403, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    if (license.expiresAt && license.expiresAt < new Date()) {
      return NextResponse.json(
        { valid: false, error: "license_expired" },
        { status: 403, headers: { "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Determine tier and limits
    const userTier = license.user?.tier || "free";
    let maxProductionProducts = 10; // Free tier default

    if (userTier === "pro" || userTier === "scale") {
      maxProductionProducts = 999999; // Unlimited
    }

    // Update last verified + store domain (machine ID)
    await prisma.licenseKey.update({
      where: { id: license.id },
      data: {
        lastVerifiedAt: new Date(),
        machineId: domain || null,
      },
    });

    // Build response
    return NextResponse.json(
      {
        valid: true,
        tier: userTier,
        max_production_products: maxProductionProducts,
        products: (license.user?.products || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          is_production: p.isProduction,
        })),
        license_key: license.key,
        customer_email: license.customerEmail,
        status: license.status,
        expires_at: license.expiresAt?.toISOString() || null,
      },
      { headers: { "Access-Control-Allow-Origin": "*" } }
    );
  } catch (error) {
    console.error("[WordPress License Verify] Error:", error);
    return NextResponse.json(
      { valid: false, error: "internal_error" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}

// CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
