import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// GET — list API keys
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      key: true,
      active: true,
      scopes: true,
      lastUsed: true,
      createdAt: true,
      expiresAt: true,
    },
  });

  // Mask the key (show only first 20 chars)
  const masked = keys.map((k) => ({
    ...k,
    keyPreview: k.key.substring(0, 20) + "..." + k.key.slice(-4),
    keyFull: k.key, // include full key only if just created
  }));

  return NextResponse.json({ success: true, keys: masked });
}

// POST — generate new API key
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const name = body.name || "WordPress Plugin";

  // Generate secure key: embp_live_sk_ + 32 hex chars
  const raw = crypto.randomBytes(32).toString("hex");
  const key = `embp_live_sk_${raw}`;

  const apiKey = await prisma.apiKey.create({
    data: {
      name,
      key,
      prefix: "embp_live_sk",
      active: true,
      scopes: "read,write,verify",
      userId: user.id,
    },
  });

  return NextResponse.json({
    success: true,
    apiKey: {
      id: apiKey.id,
      name: apiKey.name,
      key: apiKey.key, // full key shown ONCE on creation
      createdAt: apiKey.createdAt,
    },
  });
}

// DELETE — revoke API key
export async function DELETE(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const keyId = searchParams.get("id");
  if (!keyId) return NextResponse.json({ success: false, error: "Missing key ID" }, { status: 400 });

  // Verify ownership
  const existing = await prisma.apiKey.findFirst({
    where: { id: keyId, userId: user.id },
  });

  if (!existing) return NextResponse.json({ success: false, error: "Key not found" }, { status: 404 });

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { active: false },
  });

  return NextResponse.json({ success: true });
}
