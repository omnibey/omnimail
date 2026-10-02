/**
 * OmniBey / OmniMail - Cloudflare Email Routing Worker
 * 
 * Deployment Instructions:
 * 1. Go to Cloudflare Dashboard -> Email Routing -> Email Workers.
 * 2. Create a new Worker and paste this script.
 * 3. Set Environment Variable / Secret:
 *    - OMNIMAIL_INGEST_URL: "https://omnibey.com/api/email/ingest"
 *    - INGESTION_SECRET: "your_strong_ingestion_secret_here"
 * 4. In Email Routing -> Routing Rules, set:
 *    - Custom address: Catch-all (*@omnibey.com) -> Send to Worker.
 */

export default {
  async email(message, env, ctx) {
    const ingestUrl = env.OMNIMAIL_INGEST_URL || 'https://omnibey.com/api/email/ingest';
    const secret = env.INGESTION_SECRET || '';

    try {
      // 1. Read raw MIME stream from incoming email
      const rawEmail = await new Response(message.raw).text();

      // 2. Extract Cloudflare SPF & DKIM validation headers
      const spf = message.headers.get('spf') || 'neutral';
      const dkim = message.headers.get('dkim') || 'neutral';

      const payload = {
        to: message.to,
        from: message.from,
        subject: message.headers.get('subject') || '(No Subject)',
        spf: spf.toLowerCase().includes('pass') ? 'pass' : (spf.toLowerCase().includes('fail') ? 'fail' : 'neutral'),
        dkim: dkim.toLowerCase().includes('pass') ? 'pass' : (dkim.toLowerCase().includes('fail') ? 'fail' : 'neutral'),
        rawMime: rawEmail,
        timestamp: new Date().toISOString(),
      };

      // 3. Post to OmniBey Ingestion Webhook
      const response = await fetch(ingestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${secret}`,
          'User-Agent': 'OmniBey-Cloudflare-Worker/1.0',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`[OmniMail Worker] Ingestion webhook returned error: ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('[OmniMail Worker] Fatal error processing incoming email:', err);
      // Even if webhook fails, do not crash worker
    }
  },
};
