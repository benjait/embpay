import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { handleApiError } from "@/lib/errors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isValidEmail } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 attempts per hour per IP
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`forgot-password:${ip}`, {
      maxRequests: 5,
      windowSeconds: 60 * 60,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.toLowerCase().trim(),
      {
        redirectTo: `${request.headers.get('origin') || 'https://embpay.io'}/auth/callback?type=recovery`,
      }
    );

    if (error) {
      // Don't reveal if email exists for security
      console.error("Password reset error:", error);
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error) {
    return handleApiError(error, "Forgot Password");
  }
}
