import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function generateEmbedCode(productId: string, baseUrl: string) {
  return {
    iframe: `<iframe src="${baseUrl}/embed/${productId}" style="width:100%;max-width:480px;height:600px;border:none;border-radius:12px;" allowtransparency="true"></iframe>`,
    link: `${baseUrl}/checkout/${productId}`,
    button: `<a href="${baseUrl}/checkout/${productId}" style="display:inline-block;padding:12px 32px;background:#6366f1;color:white;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">Buy Now</a>`,
    script: `<script src="${baseUrl}/embed.js" data-product="${productId}"></script>`,
  };
}
