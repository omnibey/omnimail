import { nanoid } from 'nanoid';

export const SESSION_COOKIE_NAME = 'omnimail_session_token';

/**
 * Returns or initializes client-side session token
 */
export function getOrCreateClientSession(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const existing = localStorage.getItem(SESSION_COOKIE_NAME);
    if (existing && existing.length > 10) {
      return existing;
    }

    const newSession = `anon_${nanoid(24)}`;
    localStorage.setItem(SESSION_COOKIE_NAME, newSession);
    document.cookie = `${SESSION_COOKIE_NAME}=${newSession}; path=/; max-age=2592000; SameSite=Lax`;
    return newSession;
  } catch {
    return `anon_${nanoid(24)}`;
  }
}

/**
 * Saves active mailbox address locally for fast recovery on page refresh
 */
export function saveActiveMailboxLocally(address: string, mailboxId: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('omnimail_active_address', address);
    localStorage.setItem('omnimail_active_id', mailboxId);
    
    // Maintain a list of user's active mailboxes for the multi-mailbox switcher
    const listJson = localStorage.getItem('omnimail_recent_mailboxes') || '[]';
    const list: Array<{ address: string; id: string }> = JSON.parse(listJson);
    if (!list.some((item) => item.address === address)) {
      list.unshift({ address, id: mailboxId });
      localStorage.setItem('omnimail_recent_mailboxes', JSON.stringify(list.slice(0, 10)));
    }
  } catch (e) {
    console.error('Failed to store active mailbox locally', e);
  }
}

export function getLocalRecentMailboxes(): Array<{ address: string; id: string }> {
  if (typeof window === 'undefined') return [];
  try {
    const listJson = localStorage.getItem('omnimail_recent_mailboxes');
    return listJson ? JSON.parse(listJson) : [];
  } catch {
    return [];
  }
}

export function removeLocalMailbox(address: string) {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalRecentMailboxes().filter((m) => m.address !== address);
    localStorage.setItem('omnimail_recent_mailboxes', JSON.stringify(list));
    if (localStorage.getItem('omnimail_active_address') === address) {
      localStorage.removeItem('omnimail_active_address');
      localStorage.removeItem('omnimail_active_id');
    }
  } catch (e) {
    console.error('Failed to remove local mailbox', e);
  }
}
