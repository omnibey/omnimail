export interface DetectedOtp {
  code: string;
  type: 'numeric' | 'alphanumeric';
  confidence: 'high' | 'medium';
  contextSnippet?: string;
}

/**
 * Scans email subject, plain text, and HTML for verification codes and OTPs
 */
export function extractOtpFromEmail(
  subject?: string | null,
  bodyText?: string | null,
  bodyHtml?: string | null
): DetectedOtp | null {
  const combined = `${subject || ''} \n ${bodyText || ''}`;

  // 1. High confidence explicit regex: "code is 123456", "verification code: 123456", "OTP: 123456", "PIN: 123456"
  const explicitRegexes = [
    /(?:verification|security|confirm(?:ation)?|one-time|login|auth(?:entication)?)\s+code(?:\s+is)?[:\s]+([0-9]{4,8})/i,
    /(?:use\s+code|enter\s+code)[:\s]+([0-9]{4,8})/i,
    /(?:OTP|pin|passcode)(?:\s+is)?[:\s]+([0-9]{4,8})/i,
    /code[:\s]+([0-9]{4,8})/i,
  ];

  for (const regex of explicitRegexes) {
    const match = combined.match(regex);
    if (match && match[1]) {
      return {
        code: match[1].trim(),
        type: 'numeric',
        confidence: 'high',
        contextSnippet: match[0],
      };
    }
  }

  // 2. Check subject line for standalone 4-8 digit numbers
  if (subject) {
    const subjectMatch = subject.match(/\b([0-9]{4,8})\b/);
    if (subjectMatch) {
      return {
        code: subjectMatch[1],
        type: 'numeric',
        confidence: 'high',
        contextSnippet: subject,
      };
    }
  }

  // 3. Scan HTML tags with large bold font or code tags (e.g. <code>123456</code> or <span style="font-size:32px">123456</span>)
  if (bodyHtml) {
    const htmlCodeMatch = bodyHtml.match(/<code[^>]*>\s*([0-9]{4,8})\s*<\/code>/i);
    if (htmlCodeMatch) {
      return {
        code: htmlCodeMatch[1].trim(),
        type: 'numeric',
        confidence: 'high',
      };
    }

    const styledCodeMatch = bodyHtml.match(/letter-spacing:[^;]+;\s*color:[^;]+;\s*[^>]*>([0-9]{4,8})</i);
    if (styledCodeMatch) {
      return {
        code: styledCodeMatch[1].trim(),
        type: 'numeric',
        confidence: 'high',
      };
    }
  }

  // 4. Fallback search for isolated 6-digit number in the first 500 characters of text
  if (bodyText) {
    const textSnippet = bodyText.slice(0, 500);
    const isolatedMatch = textSnippet.match(/\b([0-9]{6})\b/);
    if (isolatedMatch) {
      return {
        code: isolatedMatch[1],
        type: 'numeric',
        confidence: 'medium',
      };
    }
  }

  return null;
}
