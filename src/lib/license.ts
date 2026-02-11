import crypto from "crypto";
import prisma from "@/lib/prisma";

// Base32 charset without confusing characters (no 0/O, 1/I/L)
const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Generate a license key: PREFIX-XXXX-XXXX-XXXX-XXXX
 */
export function generateLicenseKey(prefix: string = "EMBP"): string {
  const groups: string[] = [];
  for (let g = 0; g < 4; g++) {
    let group = "";
    for (let i = 0; i < 4; i++) {
      const idx = crypto.randomInt(0, CHARS.length);
      group += CHARS[idx];
    }
    groups.push(group);
  }
  return `${prefix}-${groups.join("-")}`;
}

/**
 * Validate license key format (not DB check — just format).
 */
export function isValidKeyFormat(key: string): boolean {
  return /^[A-Z]{2,8}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(key);
}

/**
 * Create a license key for a completed order.
 */
export async function createLicenseForOrder(params: {
  orderId: string;
  productId: string;
  userId: string;
  customerEmail: string;
  customerName?: string;
}): Promise<{ key: string; id: string } | null> {
  try {
    // Get product config
    const product = await prisma.product.findUnique({
      where: { id: params.productId },
      select: {
        type: true,
        licensePrefix: true,
        maxActivations: true,
        licenseDurationDays: true,
      },
    });

    if (!product) return null;

    // Only generate for license product types
    if (product.type !== "one_time_license" && product.type !== "subscription_license") {
      return null;
    }

    // Check if license already exists for this order (idempotency)
    const existing = await prisma.licenseKey.findUnique({
      where: { orderId: params.orderId },
    });
    if (existing) {
      return { key: existing.key, id: existing.id };
    }

    // Generate unique key
    let key: string;
    let attempts = 0;
    do {
      key = generateLicenseKey(product.licensePrefix || "EMBP");
      const exists = await prisma.licenseKey.findUnique({ where: { key } });
      if (!exists) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      throw new Error("Failed to generate unique license key after 10 attempts");
    }

    // Calculate expiry
    let expiresAt: Date | null = null;
    if (product.licenseDurationDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + product.licenseDurationDays);
    }

    // Create license
    const license = await prisma.licenseKey.create({
      data: {
        key,
        productId: params.productId,
        orderId: params.orderId,
        userId: params.userId,
        customerEmail: params.customerEmail,
        customerName: params.customerName || null,
        maxActivations: product.maxActivations || 1,
        expiresAt,
      },
    });

    return { key: license.key, id: license.id };
  } catch (error) {
    console.error("[License] Failed to create:", error);
    return null;
  }
}

/**
 * Verify a license key.
 */
export async function verifyLicense(params: {
  key: string;
  machineId?: string;
  productId?: string;
}): Promise<{
  valid: boolean;
  error?: string;
  license?: {
    id: string;
    status: string;
    expiresAt: string | null;
    activations: number;
    maxActivations: number;
    product: string;
    customer: string;
  };
}> {
  try {
    const license = await prisma.licenseKey.findUnique({
      where: { key: params.key },
      include: {
        product: { select: { name: true, id: true } },
        activations: { where: { isActive: true } },
      },
    });

    if (!license) {
      return { valid: false, error: "license_not_found" };
    }

    // Check product match
    if (params.productId && license.productId !== params.productId) {
      return { valid: false, error: "product_mismatch" };
    }

    // Check status
    if (license.status === "revoked") {
      return { valid: false, error: "license_revoked" };
    }
    if (license.status === "suspended") {
      return { valid: false, error: "license_suspended" };
    }

    // Check expiry
    if (license.expiresAt && license.expiresAt < new Date()) {
      // Auto-expire
      await prisma.licenseKey.update({
        where: { id: license.id },
        data: { status: "expired" },
      });
      return { valid: false, error: "license_expired" };
    }

    // Update last verified
    await prisma.licenseKey.update({
      where: { id: license.id },
      data: { lastVerifiedAt: new Date() },
    });

    return {
      valid: true,
      license: {
        id: license.id,
        status: license.status,
        expiresAt: license.expiresAt?.toISOString() || null,
        activations: license.activations.length,
        maxActivations: license.maxActivations,
        product: license.product.name,
        customer: license.customerEmail,
      },
    };
  } catch (error) {
    console.error("[License] Verify error:", error);
    return { valid: false, error: "internal_error" };
  }
}

/**
 * Activate a license on a machine.
 */
export async function activateLicense(params: {
  key: string;
  machineId: string;
  machineName?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{
  success: boolean;
  error?: string;
  activation?: { id: string; machineId: string };
}> {
  try {
    const license = await prisma.licenseKey.findUnique({
      where: { key: params.key },
      include: { activations: { where: { isActive: true } } },
    });

    if (!license) return { success: false, error: "license_not_found" };
    if (license.status !== "active") return { success: false, error: `license_${license.status}` };
    if (license.expiresAt && license.expiresAt < new Date()) {
      return { success: false, error: "license_expired" };
    }

    // Check if already activated on this machine
    const existing = license.activations.find(a => a.machineId === params.machineId);
    if (existing) {
      // Update last seen
      await prisma.licenseActivation.update({
        where: { id: existing.id },
        data: { lastSeenAt: new Date(), ipAddress: params.ipAddress },
      });
      return { success: true, activation: { id: existing.id, machineId: existing.machineId } };
    }

    // Check activation limit
    if (license.activations.length >= license.maxActivations) {
      return {
        success: false,
        error: "max_activations_reached",
      };
    }

    // Create activation
    const activation = await prisma.licenseActivation.create({
      data: {
        licenseId: license.id,
        machineId: params.machineId,
        machineName: params.machineName || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
      },
    });

    // Update count
    await prisma.licenseKey.update({
      where: { id: license.id },
      data: { currentActivations: { increment: 1 } },
    });

    return { success: true, activation: { id: activation.id, machineId: activation.machineId } };
  } catch (error) {
    console.error("[License] Activate error:", error);
    return { success: false, error: "internal_error" };
  }
}

/**
 * Deactivate a license from a machine.
 */
export async function deactivateLicense(params: {
  key: string;
  machineId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const license = await prisma.licenseKey.findUnique({
      where: { key: params.key },
    });

    if (!license) return { success: false, error: "license_not_found" };

    const activation = await prisma.licenseActivation.findUnique({
      where: {
        licenseId_machineId: {
          licenseId: license.id,
          machineId: params.machineId,
        },
      },
    });

    if (!activation || !activation.isActive) {
      return { success: false, error: "activation_not_found" };
    }

    await prisma.licenseActivation.update({
      where: { id: activation.id },
      data: { isActive: false },
    });

    await prisma.licenseKey.update({
      where: { id: license.id },
      data: { currentActivations: { decrement: 1 } },
    });

    return { success: true };
  } catch (error) {
    console.error("[License] Deactivate error:", error);
    return { success: false, error: "internal_error" };
  }
}
