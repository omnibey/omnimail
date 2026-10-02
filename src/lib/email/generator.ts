// Clean adjectives and nouns to produce clean, recognizable disposable email usernames
const ADJECTIVES = [
  'swift', 'bright', 'cyber', 'hyper', 'quiet', 'brave', 'silver', 'prime',
  'silent', 'vivid', 'solar', 'lunar', 'apex', 'amber', 'echo', 'pulse',
  'crystal', 'shadow', 'zenith', 'stellar', 'mystic', 'delta', 'nova', 'cosmic',
  'turbo', 'smart', 'rapid', 'atomic', 'aurora', 'glide', 'breeze', 'vortex'
];

const NOUNS = [
  'falcon', 'fox', 'lynx', 'badger', 'panther', 'raven', 'eagle', 'otter',
  'stream', 'harbor', 'beacon', 'spark', 'vector', 'orbit', 'matrix', 'nexus',
  'pilot', 'scout', 'relay', 'shield', 'cipher', 'signal', 'comet', 'horizon',
  'rover', 'voyager', 'ranger', 'drift', 'wave', 'atlas', 'phoenix', 'stride'
];

export function generateRandomUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}.${noun}${num}`;
}

export function generateRandomMailboxAddress(domain: string = 'omnibey.com'): {
  address: string;
  localPart: string;
  domain: string;
} {
  const localPart = generateRandomUsername();
  return {
    address: `${localPart}@${domain}`.toLowerCase(),
    localPart,
    domain: domain.toLowerCase(),
  };
}

export function generateRandomAddress(domain: string = 'mail.omnibey.com'): string {
  return generateRandomMailboxAddress(domain).address;
}

export function sanitizeLocalPart(input: string): string {
  // Allow lowercase alphanumeric, dots, hyphens, and underscores
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._-]/g, '')
    .slice(0, 40);
}

export function isValidLocalPart(input: string): boolean {
  if (!input || input.length < 3 || input.length > 40) return false;
  return /^[a-z0-9]+([._-][a-z0-9]+)*$/i.test(input);
}
