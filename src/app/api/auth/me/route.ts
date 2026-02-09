import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-supabase";
import { handleApiError } from "@/lib/errors";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        businessName: user.businessName,
        stripeConnected: user.stripeConnected,
      },
    });
  } catch (error) {
    return handleApiError(error, "Get user");
  }
}
