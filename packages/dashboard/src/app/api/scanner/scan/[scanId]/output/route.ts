/**
 * Scanner Scan API - Output Streaming Endpoint
 *
 * GET /api/scanner/scan/:scanId/output - Server-Sent Events stream
 */

import { NextRequest } from 'next/server';
import { getScanExecutor } from '../../../lib/scanExecutor';

/**
 * GET /api/scanner/scan/:scanId/output
 * Returns Server-Sent Events stream of scan output
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ scanId: string }> }
) {
  const { scanId } = await params;
  const timestamp = new Date().toISOString();
  console.log(`[SSE] [${timestamp}] Client connecting for scan ${scanId}`);

  const executor = getScanExecutor(scanId);
  console.log(`[SSE] Executor found:`, executor ? 'YES' : 'NO');

  if (!executor) {
    console.error(`[SSE] Scan ${scanId} not found in registry`);

    // Include debug information in 404 response
    return new Response(
      JSON.stringify({
        error: 'Scan not found or expired',
        scanId,
        timestamp,
        help: {
          message: 'The scan executor was not found in the registry.',
          possibleCauses: [
            'Scan may have expired (1 hour retention)',
            'Scan may have failed during startup',
            'Module reload issue (check server logs for HEALTH CHECK FAILED)',
          ],
          troubleshooting: [
            'Check server logs for registration messages',
            'Try the /api/scanner/debug/registry endpoint to inspect active scans',
            'Retry the scan operation',
          ],
        },
      }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Create Server-Sent Events stream
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Send buffered output immediately (for clients joining mid-scan)
      const bufferedOutput = executor.getBufferedOutput();
      for (const line of bufferedOutput) {
        const sseMessage = `data: ${JSON.stringify({ type: 'output', data: line, timestamp: new Date().toISOString() })}\n\n`;
        controller.enqueue(encoder.encode(sseMessage));
      }

      // Listen for new output events
      const outputHandler = (line: string) => {
        const sseMessage = `data: ${JSON.stringify({ type: 'output', data: line, timestamp: new Date().toISOString() })}\n\n`;
        controller.enqueue(encoder.encode(sseMessage));
      };

      // Listen for progress events
      const progressHandler = (progress: any) => {
        const sseMessage = `data: ${JSON.stringify({ type: 'progress', data: progress, timestamp: new Date().toISOString() })}\n\n`;
        controller.enqueue(encoder.encode(sseMessage));
      };

      // Listen for completion
      const completeHandler = (progress: any) => {
        const sseMessage = `data: ${JSON.stringify({ type: 'complete', data: progress, timestamp: new Date().toISOString() })}\n\n`;
        controller.enqueue(encoder.encode(sseMessage));
        cleanup();
        controller.close();
      };

      // Listen for errors
      const errorHandler = (error: string) => {
        const sseMessage = `data: ${JSON.stringify({ type: 'error', data: error, timestamp: new Date().toISOString() })}\n\n`;
        controller.enqueue(encoder.encode(sseMessage));
        cleanup();
        controller.close();
      };

      // Attach event listeners
      executor.on('output', outputHandler);
      executor.on('progress', progressHandler);
      executor.on('complete', completeHandler);
      executor.on('error', errorHandler);

      // Cleanup function
      const cleanup = () => {
        executor.removeListener('output', outputHandler);
        executor.removeListener('progress', progressHandler);
        executor.removeListener('complete', completeHandler);
        executor.removeListener('error', errorHandler);
      };

      // Handle client disconnect
      request.signal.addEventListener('abort', () => {
        cleanup();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
