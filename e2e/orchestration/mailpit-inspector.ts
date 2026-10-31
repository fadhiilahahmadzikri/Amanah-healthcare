export interface MailpitMessageSummary {
  ID: string;
  Subject: string;
  To: Array<{ Name: string; Address: string }>;
  Created: string;
}

export interface MailpitMessageDetail {
  ID: string;
  Subject: string;
  To: Array<{ Name: string; Address: string }>;
  Text: string;
  HTML: string;
}

export class MailpitInspector {
  private baseUrl: string;

  constructor(baseUrl = process.env.MAILPIT_URL || 'http://localhost:8025') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  async clearAll(): Promise<void> {
    try {
      await fetch(`${this.baseUrl}/api/v1/messages`, { method: 'DELETE' });
    } catch {
      // ignore
    }
  }

  async getLatestOtpForEmail(targetEmail: string, timeoutMs = 15000): Promise<string> {
    const normalizedEmail = targetEmail.toLowerCase().trim();
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const res = await fetch(`${this.baseUrl}/api/v1/messages`);
        if (res.ok) {
          const data = (await res.json()) as { messages?: MailpitMessageSummary[] };
          const msgs = data.messages || [];
          const match = msgs.find((m) =>
            m.To?.some((t) => t.Address.toLowerCase().trim() === normalizedEmail)
          );

          if (match) {
            const detailRes = await fetch(`${this.baseUrl}/api/v1/message/${match.ID}`);
            if (detailRes.ok) {
              const detail = (await detailRes.json()) as MailpitMessageDetail;
              const content = `${detail.Text || ''}\n${detail.HTML || ''}`;
              
              // Match explicit "Kode OTP: 123456" or 6-digit styled OTP
              const otpMatch = content.match(/Kode OTP:\s*([0-9]{6})/i) ||
                               content.match(/>([0-9]{6})<\//) ||
                               content.match(/\b([0-9]{6})\b/);
              if (otpMatch && otpMatch[1]) {
                return otpMatch[1];
              }
            }
          }
        }
      } catch {
        // Retry
      }

      await new Promise((r) => setTimeout(r, 500));
    }

    throw new Error(`Timed out waiting for OTP email for ${targetEmail} from Mailpit after ${timeoutMs}ms`);
  }
}
