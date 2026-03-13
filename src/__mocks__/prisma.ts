import { vi } from "vitest";

const prisma = {
  product: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  order: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  coupon: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  licenseKey: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  licenseActivation: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  webhookLog: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  apiKey: {
    findUnique: vi.fn(),
  },
};

export default prisma;
export { prisma };
