import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// WARNING: Remove this file after running migration!
export async function POST(request: NextRequest) {
  // Simple security - check for secret header
  const secret = request.headers.get('x-migration-secret');
  if (secret !== 'embpay-migrate-2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { stdout, stderr } = await execAsync('npx prisma db push --accept-data-loss');
    
    return NextResponse.json({
      success: true,
      stdout,
      stderr,
      message: 'Migration completed!'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error)
    }, { status: 500 });
  }
}

// Also allow GET for simple check
export async function GET() {
  return NextResponse.json({
    message: 'Migration endpoint. Send POST with x-migration-secret header.',
    warning: 'Remove this file after migration!'
  });
}
