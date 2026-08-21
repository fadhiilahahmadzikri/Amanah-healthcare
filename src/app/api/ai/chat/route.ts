import { NextRequest } from 'next/server';
import { buildClinicSystemPrompt } from '@/config/clinic-context-prompt';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages = [] } = body;

    const gemma4Url = process.env.GEMMA4_API_URL || 'https://www.gemma4.com/api/chat';

    // Ensure clinic knowledge system prompt is always injected at the beginning
    const fullMessages = [
      { role: 'system', content: buildClinicSystemPrompt() },
      ...messages.filter((m: { role: string }) => m.role !== 'system')
    ];

    const response = await fetch(gemma4Url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: fullMessages,
        stream: true
      }),
      signal: req.signal
    });

    if (!response.ok || !response.body) {
      const errorText = await response.text().catch(() => 'Gemma4 API unreachable');
      return new Response(JSON.stringify({ error: `Gemma4 API error: ${errorText}` }), {
        status: response.status || 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed) continue;

              if (trimmed === 'data: [DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                continue;
              }

              if (trimmed.startsWith('data: ')) {
                try {
                  const jsonStr = trimmed.slice(6);
                  const parsed = JSON.parse(jsonStr);
                  const deltaContent =
                    parsed.choices?.[0]?.delta?.content ?? parsed.choices?.[0]?.text ?? '';

                  if (deltaContent) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ text: deltaContent })}\n\n`)
                    );
                  }
                } catch {
                  // Pass through unparsed line if necessary
                }
              }
            }
          }

          if (buffer.trim()) {
            const trimmed = buffer.trim();
            if (trimmed.startsWith('data: ') && trimmed !== 'data: [DONE]') {
              try {
                const parsed = JSON.parse(trimmed.slice(6));
                const deltaContent = parsed.choices?.[0]?.delta?.content ?? '';
                if (deltaContent) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ text: deltaContent })}\n\n`)
                  );
                }
              } catch {
                // Ignore parse errors on trailing buffer
              }
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (err) {
          controller.error(err);
        } finally {
          reader.releaseLock();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive'
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
