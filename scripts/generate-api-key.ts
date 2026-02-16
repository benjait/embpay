#!/usr/bin/env node
/**
 * Generate EmbPay API Key
 * 
 * Usage: npx tsx scripts/generate-api-key.ts
 */

import crypto from "crypto";

function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(32);
  const key = randomBytes.toString("base64url"); // URL-safe base64
  return `embpay_${key}`;
}

const apiKey = generateApiKey();

console.log("\n🔑 EmbPay API Key Generated:\n");
console.log(`   ${apiKey}`);
console.log("\n📋 Add to WordPress Plugin Settings:");
console.log(`   WP Admin → EmbPay → Settings → API Key`);
console.log("\n⚠️  Store securely - this key allows payment creation!\n");

// Output for easy copy-paste
console.log("━".repeat(60));
console.log(apiKey);
console.log("━".repeat(60));
