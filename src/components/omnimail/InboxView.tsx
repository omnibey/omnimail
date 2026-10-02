'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MailboxBar } from './MailboxBar';
import { MessageList } from './MessageList';
import { MessageDetail } from './MessageDetail';
import { MultiMailboxDrawer } from './MultiMailboxDrawer';
import { SendTestEmailModal } from './SendTestEmailModal';
import { useToast } from '@/components/ui/Toast';
import {
  getOrCreateClientSession,
  saveActiveMailboxLocally,
  getLocalRecentMailboxes,
  removeLocalMailbox,
} from '@/lib/session/anonymous-session';
import { DomainItem, EmailMessage, Mailbox } from '@/types/email';

const AUTO_REFRESH_INTERVAL = 10; // seconds

export const InboxView: React.FC = () => {
  const [sessionToken, setSessionToken] = useState<string>('');
  const [domains, setDomains] = useState<DomainItem[]>([
    { id: '1', domainName: 'omnibey.com', isActive: true, isPremium: false, createdAt: '' },
    { id: '2', domainName: 'mail.omnibey.com', isActive: true, isPremium: false, createdAt: '' },
    { id: '3', domainName: 'omnimail.app', isActive: true, isPremium: true, createdAt: '' },
  ]);
  const [currentDomain, setCurrentDomain] = useState<string>('omnibey.com');
  const [mailbox, setMailbox] = useState<Mailbox | null>(null);
  const [messages, setMessages] = useState<EmailMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<EmailMessage | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoRefreshSeconds, setAutoRefreshSeconds] = useState<number>(AUTO_REFRESH_INTERVAL);
  const [multiDrawerOpen, setMultiDrawerOpen] = useState<boolean>(false);
  const [testModalOpen, setTestModalOpen] = useState<boolean>(false);
  const [recentMailboxes, setRecentMailboxes] = useState<Array<{ address: string; id: string }>>([]);

  const { success, error, info } = useToast();
  const previousMessageCountRef = useRef<number>(0);

  // 1. Initialize session & fetch domains on mount
  useEffect(() => {
    const token = getOrCreateClientSession();
    setSessionToken(token);
    setRecentMailboxes(getLocalRecentMailboxes());

    fetch('/api/domains')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.domains?.length > 0) {
          setDomains(data.domains);
          setCurrentDomain(data.domains[0].domainName);
        }
      })
      .catch((err) => console.error('Failed to fetch domains', err));
  }, []);

  // 2. Load or create initial mailbox once session is ready
  const initMailbox = useCallback(
    async (domainToUse = currentDomain, customPart?: string) => {
      setIsLoading(true);
      try {
        const token = sessionToken || getOrCreateClientSession();
        const res = await fetch('/api/mailboxes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-token': token,
          },
          body: JSON.stringify({
            domain: domainToUse,
            customLocalPart: customPart,
            sessionToken: token,
          }),
        });

        const data = await res.json();
        if (data.success && data.mailbox) {
          setMailbox(data.mailbox);
          saveActiveMailboxLocally(data.mailbox.address, data.mailbox.id);
          setRecentMailboxes(getLocalRecentMailboxes());
          setMessages([]);
          setSelectedMessage(null);
        } else {
          error(data.error || 'Failed to initialize temporary mailbox');
        }
      } catch (e) {
        error('Connection error creating temporary mailbox');
      } finally {
        setIsLoading(false);
      }
    },
    [currentDomain, sessionToken, error]
  );

  useEffect(() => {
    if (sessionToken && !mailbox) {
      initMailbox();
    }
  }, [sessionToken, mailbox, initMailbox]);

  // 3. Fetch messages for active mailbox
  const fetchMessages = useCallback(
    async (showIndicator = false) => {
      if (!mailbox) return;
      if (showIndicator) setIsRefreshing(true);

      try {
        const token = sessionToken || getOrCreateClientSession();
        const res = await fetch(
          `/api/mailboxes/${encodeURIComponent(mailbox.id)}/messages?address=${encodeURIComponent(
            mailbox.address
          )}`,
          {
            headers: { 'x-session-token': token },
          }
        );

        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          // Play sound / notification if new email arrived
          if (
            data.messages.length > previousMessageCountRef.current &&
            previousMessageCountRef.current > 0
          ) {
            info(`New email received: ${data.messages[0].subject}`);
            try {
              // Play a pleasant chime if audio context allows
              const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
              if (AudioContextClass) {
                const audioCtx = new AudioContextClass();
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
                gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.2);
              }
            } catch {
              // Ignore audio autoplay restrictions
            }
          }

          previousMessageCountRef.current = data.messages.length;
          setMessages(data.messages);

          // Update selected message if it was updated
          if (selectedMessage) {
            const updated = data.messages.find((m: EmailMessage) => m.id === selectedMessage.id);
            if (updated) setSelectedMessage(updated);
          }
        }
      } catch (err) {
        console.error('Error fetching mailbox messages', err);
      } finally {
        if (showIndicator) setIsRefreshing(false);
      }
    },
    [mailbox, sessionToken, selectedMessage, info]
  );

  // 4. Auto-refresh ticker (10s countdown)
  useEffect(() => {
    if (!mailbox) return;

    fetchMessages(false);

    const timer = setInterval(() => {
      setAutoRefreshSeconds((prev) => {
        if (prev <= 1) {
          fetchMessages(false);
          return AUTO_REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [mailbox, fetchMessages]);

  // Action handlers
  const handleSelectMessage = async (msg: EmailMessage) => {
    setSelectedMessage(msg);

    // Mark as read
    if (!msg.isRead) {
      try {
        await fetch(`/api/messages/${msg.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isRead: true }),
        });
        setMessages((prev) =>
          prev.map((item) => (item.id === msg.id ? { ...item, isRead: true } : item))
        );
      } catch {
        // silent
      }
    }
  };

  const handleExtendTimer = async () => {
    if (!mailbox) return;
    try {
      const res = await fetch(`/api/mailboxes/${mailbox.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extendMinutes: 60 }),
      });
      const data = await res.json();
      if (data.success) {
        setMailbox((prev) => (prev ? { ...prev, expiresAt: data.expiresAt } : null));
        success('Mailbox extended by 60 minutes!');
      } else {
        error(data.error || 'Failed to extend mailbox');
      }
    } catch {
      error('Failed to extend mailbox expiration');
    }
  };

  const handleDeleteMailbox = async () => {
    if (!mailbox) return;
    if (!confirm(`Delete temporary address ${mailbox.address}? All messages will be wiped.`)) {
      return;
    }

    try {
      await fetch(`/api/mailboxes/${mailbox.id}`, { method: 'DELETE' });
      removeLocalMailbox(mailbox.address);
      setRecentMailboxes(getLocalRecentMailboxes());
      success(`Mailbox ${mailbox.address} destroyed.`);
      // Create a fresh mailbox
      initMailbox(currentDomain);
    } catch {
      error('Failed to delete mailbox');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await fetch(`/api/messages/${id}`, { method: 'DELETE' });
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      success('Email deleted');
    } catch {
      error('Failed to delete message');
    }
  };

  const handleSelectLocalAddress = (address: string, id: string) => {
    const parts = address.split('@');
    const domain = parts[1] || currentDomain;
    setMailbox({
      id,
      address,
      localPart: parts[0],
      domain,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      isActive: true,
      isCustom: false,
    });
    setSelectedMessage(null);
    info(`Switched to ${address}`);
  };

  const handleDeleteLocalAddress = (address: string) => {
    removeLocalMailbox(address);
    setRecentMailboxes(getLocalRecentMailboxes());
    if (mailbox?.address === address) {
      initMailbox(currentDomain);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Mailbox Control Bar */}
      <MailboxBar
        address={mailbox?.address || ''}
        expiresAt={mailbox?.expiresAt || ''}
        domains={domains}
        currentDomain={currentDomain}
        mailboxCount={recentMailboxes.length || 1}
        isLoading={isLoading}
        onRefreshEmail={() => fetchMessages(true)}
        onGenerateRandom={() => initMailbox(currentDomain)}
        onCustomAddress={(prefix, dom) => initMailbox(dom, prefix)}
        onSelectDomain={(dom) => {
          setCurrentDomain(dom);
          initMailbox(dom);
        }}
        onExtendTimer={handleExtendTimer}
        onDeleteMailbox={handleDeleteMailbox}
        onOpenMultiDrawer={() => setMultiDrawerOpen(true)}
      />

      {/* Main Inbox View: Split-Pane on desktop, responsive stack on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px]">
        {/* Message List Column */}
        <div
          className={`lg:col-span-5 h-[580px] ${
            selectedMessage ? 'hidden lg:block' : 'block'
          }`}
        >
          <MessageList
            messages={messages}
            selectedMessageId={selectedMessage?.id}
            onSelectMessage={handleSelectMessage}
            onRefresh={() => fetchMessages(true)}
            onOpenTestModal={() => setTestModalOpen(true)}
            isRefreshing={isRefreshing}
            autoRefreshSeconds={autoRefreshSeconds}
          />
        </div>

        {/* Message Detail Column */}
        <div
          className={`lg:col-span-7 h-[580px] ${
            selectedMessage ? 'block' : 'hidden lg:block'
          }`}
        >
          <MessageDetail
            message={selectedMessage}
            onBack={() => setSelectedMessage(null)}
            onDeleteMessage={handleDeleteMessage}
          />
        </div>
      </div>

      {/* Multi-mailbox Drawer */}
      <MultiMailboxDrawer
        isOpen={multiDrawerOpen}
        onClose={() => setMultiDrawerOpen(false)}
        mailboxes={recentMailboxes}
        currentAddress={mailbox?.address || ''}
        onSelectAddress={handleSelectLocalAddress}
        onDeleteAddress={handleDeleteLocalAddress}
        onNewAddress={() => initMailbox(currentDomain)}
      />

      {/* Simulation Modal */}
      <SendTestEmailModal
        isOpen={testModalOpen}
        onClose={() => setTestModalOpen(false)}
        address={mailbox?.address || ''}
        onEmailSent={() => fetchMessages(true)}
      />
    </div>
  );
};
