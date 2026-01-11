/**
 * Session Agent Output API Route
 *
 * GET /api/sessions/output?feature={featureName}&agent={agentId}
 * Returns agent output file contents
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAgentOutput } from '@/lib/api/sessions';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const featureName = searchParams.get('feature');
    const agentId = searchParams.get('agent');

    if (!featureName || !agentId) {
      return NextResponse.json(
        { error: 'Missing required parameters: feature and agent' },
        { status: 400 }
      );
    }

    const output = await getAgentOutput(featureName, agentId);

    if (output === null) {
      return NextResponse.json(
        { error: 'Output file not found or error reading file' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      content: output,
      feature: featureName,
      agent: agentId
    });
  } catch (error) {
    console.error('Error in /api/sessions/output:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
