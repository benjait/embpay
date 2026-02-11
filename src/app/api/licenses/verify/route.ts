import { NextRequest, NextResponse } from "next/server";
import { verifyLicense, activateLicense, deactivateLicense } from "@/lib/license";

/**
 * Public API: Verify, activate, or deactivate a license key.
 * No auth required — this is called from customer software.
 * 
 * POST /api/licenses/verify
 * Body: { key, action?: "verify"|"activate"|"deactivate", machine_id?, machine_name?, product_id? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, action = "verify", machine_id, machine_name, product_id } = body;

    if (!key) {
      return NextResponse.json(
        { valid: false, error: "missing_key" },
        { status: 400 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || undefined;
    const ua = request.headers.get("user-agent") || undefined;

    // Route by action
    switch (action) {
      case "verify": {
        const result = await verifyLicense({ key, machineId: machine_id, productId: product_id });
        return NextResponse.json(result, {
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }

      case "activate": {
        if (!machine_id) {
          return NextResponse.json(
            { success: false, error: "missing_machine_id" },
            { status: 400 }
          );
        }
        const result = await activateLicense({
          key,
          machineId: machine_id,
          machineName: machine_name,
          ipAddress: ip,
          userAgent: ua,
        });
        return NextResponse.json(result, {
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }

      case "deactivate": {
        if (!machine_id) {
          return NextResponse.json(
            { success: false, error: "missing_machine_id" },
            { status: 400 }
          );
        }
        const result = await deactivateLicense({ key, machineId: machine_id });
        return NextResponse.json(result, {
          headers: { "Access-Control-Allow-Origin": "*" },
        });
      }

      default:
        return NextResponse.json(
          { valid: false, error: "invalid_action" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[License API] Error:", error);
    return NextResponse.json(
      { valid: false, error: "internal_error" },
      { status: 500 }
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
