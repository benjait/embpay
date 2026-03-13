import { describe, it, expect } from "vitest";
import { handleApiError } from "../errors";

describe("handleApiError", () => {
  it("handles P2002 unique constraint violation", async () => {
    const error = new Error("Unique constraint failed");
    error.name = "PrismaClientKnownRequestError";
    (error as any).code = "P2002";

    const response = handleApiError(error, "Test");
    expect(response.status).toBe(409);
    const body = await response.json();
    expect(body.error).toContain("already exists");
  });

  it("handles P2025 record not found", async () => {
    const error = new Error("Record not found");
    error.name = "PrismaClientKnownRequestError";
    (error as any).code = "P2025";

    const response = handleApiError(error, "Test");
    expect(response.status).toBe(404);
  });

  it("handles P2003 foreign key constraint", async () => {
    const error = new Error("FK constraint");
    error.name = "PrismaClientKnownRequestError";
    (error as any).code = "P2003";

    const response = handleApiError(error, "Test");
    expect(response.status).toBe(409);
  });

  it("handles PrismaClientValidationError", async () => {
    const error = new Error("Validation error");
    error.name = "PrismaClientValidationError";

    const response = handleApiError(error, "Test");
    expect(response.status).toBe(400);
  });

  it("handles JSON parse errors", async () => {
    const error = new SyntaxError("Unexpected token in JSON");

    const response = handleApiError(error, "Test");
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("JSON");
  });

  it("returns 500 for unknown errors", async () => {
    const response = handleApiError(new Error("random"), "Test");
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.error).toBe("Internal server error");
  });

  it("handles non-Error objects", async () => {
    const response = handleApiError("string error", "Test");
    expect(response.status).toBe(500);
  });
});
