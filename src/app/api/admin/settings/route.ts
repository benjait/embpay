import { NextRequest, NextResponse } from "next/server";
import { getAdminUser, unauthorized, logAdminAction } from "@/lib/admin";
import fs from "fs/promises";
import path from "path";

const SETTINGS_FILE = path.join(process.cwd(), "data", "platform-settings.json");

const DEFAULT_SETTINGS = {
  platformFeePercent: 2.5,
  minPlatformFee: 0.5,
  maxPlatformFee: 100,
  stripeFeePercent: 2.9,
  stripeFixedFee: 0.3,
  enableEmailNotifications: true,
  enableLicenseKeys: true,
  enableSubscriptions: false,
  enableCoupons: true,
  freePlanProductLimit: 10,
  freePlanOrderLimit: 100,
  proPlanPrice: 29,
  scalePlanPrice: 79,
  maintenanceMode: false,
  maintenanceMessage: "We're currently under maintenance. Please check back soon.",
};

async function ensureSettingsFile() {
  try {
    await fs.mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
    try {
      await fs.access(SETTINGS_FILE);
    } catch {
      await fs.writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2));
    }
  } catch (err) {
    console.error("[Settings] Failed to ensure settings file:", err);
  }
}

async function readSettings() {
  try {
    await ensureSettingsFile();
    const data = await fs.readFile(SETTINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

async function writeSettings(settings: any) {
  try {
    await ensureSettingsFile();
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (err) {
    console.error("[Settings] Failed to write settings:", err);
    return false;
  }
}

/**
 * GET /api/admin/settings
 * Fetch platform settings
 */
export async function GET(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) return unauthorized();

  const settings = await readSettings();

  return NextResponse.json({ success: true, settings });
}

/**
 * POST /api/admin/settings
 * Update platform settings
 */
export async function POST(request: NextRequest) {
  const admin = await getAdminUser(request);
  if (!admin) return unauthorized();

  try {
    const newSettings = await request.json();

    // Validate settings
    if (
      typeof newSettings.platformFeePercent !== "number" ||
      typeof newSettings.freePlanProductLimit !== "number"
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid settings format" },
        { status: 400 }
      );
    }

    const success = await writeSettings(newSettings);

    if (success) {
      await logAdminAction({
        adminId: admin.id,
        adminEmail: admin.email!,
        action: "update",
        targetType: "settings",
        targetId: "platform",
        details: {
          changes: Object.keys(newSettings).length + " settings updated",
        },
      });
    }

    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
