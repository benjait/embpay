import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    return NextResponse.json({
      success: false,
      error: 'Upload not configured'
    }, { status: 501 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Upload failed' },
      { status: 500 }
    )
  }
}
