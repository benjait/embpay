import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { handleApiError } from "@/lib/errors";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { isValidEmail, isValidString } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 registrations per 15 minutes per IP
    const ip = getClientIp(request);
    const rateLimit = checkRateLimit(`register:${ip}`, {
      maxRequests: 5,
      windowSeconds: 15 * 60,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          },
        }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      return NextResponse.json(
        { success: false, error: "Password must be between 8 and 128 characters" },
        { status: 400 }
      );
    }

    if (name !== undefined && !isValidString(name, { maxLength: 200 })) {
      return NextResponse.json(
        { success: false, error: "Name must be 200 characters or less" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          name: name?.trim() || null,
          businessName: null,
          stripeConnected: false,
          stripeAccountId: null,
          commissionRate: 0.03,
        },
      },
    });

    if (error) {
      if (error.message.includes("already registered")) {
        return NextResponse.json(
          { success: false, error: "An account with this email already exists" },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    const user = data.user!;

    return NextResponse.json(
      { 
        success: true, 
        data: { 
          user: {
            id: user.id,
            email: user.email,
            name: user.user_metadata?.name || null,
          },
          session: data.session ? {
            access_token: data.session.access_token,
            expires_at: data.session.expires_at,
          } : null,
        } 
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error, "Register");
  }
}
