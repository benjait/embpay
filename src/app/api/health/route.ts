import { NextResponse } from "next/server";
import { isStripeConfigured } from "@/lib/stripe";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: "ok",
      stripe: isStripeConfigured ? "configured" : "not_configured",
      platform: process.env.PLATFORM_URL,
      timestamp: new Date().toISOString(),
    },
  });
}
