import { NextResponse } from "next/server";

/**
 * Handle Prisma and general errors consistently across API routes.
 * Returns a properly formatted error response.
 */
export function handleApiError(error: unknown, context: string = "API") {
  console.error(`${context} error:`, error);

  // Handle Prisma-specific errors
  if (error instanceof Error) {
    // Prisma known request errors (e.g., unique constraint, foreign key, etc.)
    if (error.name === "PrismaClientKnownRequestError") {
      const prismaError = error as Error & { code?: string; meta?: Record<string, unknown> };

      switch (prismaError.code) {
        case "P2002": // Unique constraint violation
          return NextResponse.json(
            { success: false, error: "A record with this value already exists" },
            { status: 409 }
          );
        case "P2025": // Record not found
          return NextResponse.json(
            { success: false, error: "Record not found" },
            { status: 404 }
          );
        case "P2003": // Foreign key constraint failed
          return NextResponse.json(
            { success: false, error: "Cannot perform this action due to related records" },
            { status: 409 }
          );
        case "P2014": // Relation violation
          return NextResponse.json(
            { success: false, error: "This action would violate a required relation" },
            { status: 400 }
          );
        default:
          return NextResponse.json(
            { success: false, error: "Database error occurred" },
            { status: 500 }
          );
      }
    }

    // Prisma validation errors
    if (error.name === "PrismaClientValidationError") {
      return NextResponse.json(
        { success: false, error: "Invalid data provided" },
        { status: 400 }
      );
    }

    // JSON parse errors
    if (error.name === "SyntaxError" && error.message.includes("JSON")) {
      return NextResponse.json(
        { success: false, error: "Invalid request body — expected JSON" },
        { status: 400 }
      );
    }
  }

  // Generic fallback
  return NextResponse.json(
    { success: false, error: "Internal server error" },
    { status: 500 }
  );
}
