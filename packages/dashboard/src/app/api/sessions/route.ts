/**
 * Sessions API Route
 *
 * GET /api/sessions - Get all sessions
 * GET /api/sessions?id={featureName} - Get session by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAllSessions, getSessionById } from '@/lib/api/sessions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('id');

    if (sessionId) {
      // Get specific session
      const session = await getSessionById(sessionId);

      if (!session) {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ session });
    } else {
      // Get all sessions
      const sessions = await getAllSessions();

      return NextResponse.json({
        sessions,
        count: sessions.length
      });
    }
  } catch (error) {
    console.error('Error in /api/sessions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
