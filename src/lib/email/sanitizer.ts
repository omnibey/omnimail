/**
 * Sanitizes incoming email HTML for safe rendering inside a sandboxed reader
 */
export function sanitizeEmailHtml(rawHtml?: string | null): string {
  if (!rawHtml) return '';

  let sanitized = rawHtml;

  // 1. Remove script tags and contents
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // 2. Remove event handlers like onload, onclick, onerror, onmouseover, etc.
  sanitized = sanitized.replace(/\son[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '');

  // 3. Neutralize javascript: or data: URIs in href and src
  sanitized = sanitized.replace(/(href|src)\s*=\s*['"]\s*(javascript|data):[^'"]*['"]/gi, '$1="#"');

  // 4. Force all external anchor links to open safely in a new tab
  sanitized = sanitized.replace(/<a\b([^>]*)>/gi, (match, attrs) => {
    let cleanedAttrs = attrs.replace(/\starget\s*=\s*['"][^'"]*['"]/gi, '');
    cleanedAttrs = cleanedAttrs.replace(/\srel\s*=\s*['"][^'"]*['"]/gi, '');
    return `<a ${cleanedAttrs} target="_blank" rel="noopener noreferrer nofollow">`;
  });

  return sanitized;
}

/**
 * Strips HTML tags to generate a clean snippet preview
 */
export function extractTextSnippet(htmlOrText: string, maxLength = 140): string {
  if (!htmlOrText) return '';
  const text = htmlOrText
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
}
