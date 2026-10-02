'use client';

import React, { useState } from 'react';
import {
  Search,
  RefreshCw,
  Inbox,
  Star,
  Send,
  MailOpen,
  Mail,
  Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { formatDateRelative } from '@/lib/utils';
import { EmailMessage } from '@/types/email';

interface MessageListProps {
  messages: EmailMessage[];
  selectedMessageId?: string | null;
  onSelectMessage: (msg: EmailMessage) => void;
  onRefresh: () => void;
  onOpenTestModal: () => void;
  isRefreshing: boolean;
  autoRefreshSeconds: number;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedMessageId,
  onSelectMessage,
  onRefresh,
  onOpenTestModal,
  isRefreshing,
  autoRefreshSeconds,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMessages = messages.filter((m) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.subject.toLowerCase().includes(term) ||
      m.sender.toLowerCase().includes(term) ||
      (m.senderName && m.senderName.toLowerCase().includes(term)) ||
      m.snippet.toLowerCase().includes(term)
    );
  });

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden">
      {/* Header Bar */}
      <div className="p-3 sm:p-4 border-b border-slate-800/80 bg-slate-900/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-white tracking-tight flex items-center gap-1.5">
              <Inbox className="w-4 h-4 text-indigo-400" />
              <span>Inbox</span>
            </h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Sync in {autoRefreshSeconds}s
            </span>

            <Button
              variant="outline"
              size="icon"
              onClick={onRefresh}
              isLoading={isRefreshing}
              className="h-8 w-8 text-slate-300"
              title="Refresh messages now"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>

            <Button
              variant="glow"
              size="sm"
              onClick={onOpenTestModal}
              className="h-8 text-xs px-2.5"
              title="Simulate an incoming test email"
            >
              <Send className="w-3 h-3" />
              <span>Test Email</span>
            </Button>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search sender, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500/70 transition-colors"
          />
        </div>
      </div>

      {/* Message Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
        {filteredMessages.length === 0 ? (
          <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3">
              <Mail className="w-6 h-6 text-indigo-400 animate-pulse" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">Your inbox is waiting</h4>
            <p className="text-xs text-slate-400 max-w-xs mb-4">
              Emails sent to your temporary address will appear here automatically within seconds.
            </p>
            <Button variant="secondary" size="sm" onClick={onOpenTestModal} className="text-xs">
              <Send className="w-3.5 h-3.5 text-sky-400" /> Simulate an Incoming Email
            </Button>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isSelected = selectedMessageId === msg.id;
            const senderInitial = (msg.senderName || msg.sender || '?')[0].toUpperCase();

            return (
              <div
                key={msg.id}
                onClick={() => onSelectMessage(msg)}
                className={`p-3.5 cursor-pointer transition-all flex items-start gap-3 select-none ${
                  isSelected
                    ? 'bg-indigo-950/40 border-l-4 border-l-indigo-500'
                    : msg.isRead
                    ? 'hover:bg-slate-800/40 opacity-80 hover:opacity-100'
                    : 'bg-slate-900/90 hover:bg-slate-800/60 font-semibold'
                }`}
              >
                {/* Sender Avatar */}
                <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0">
                  {senderInitial}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span
                      className={`text-xs truncate ${
                        !msg.isRead ? 'text-white font-bold' : 'text-slate-300 font-medium'
                      }`}
                    >
                      {msg.senderName || msg.sender}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {formatDateRelative(msg.receivedAt)}
                    </span>
                  </div>

                  <div
                    className={`text-xs truncate mb-1 ${
                      !msg.isRead ? 'text-sky-300 font-medium' : 'text-slate-200'
                    }`}
                  >
                    {msg.subject}
                  </div>

                  <div className="text-[11px] text-slate-400 line-clamp-1">
                    {msg.snippet || 'No text preview available'}
                  </div>

                  {/* Attachment indicator if any */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-500 font-normal">
                      <Paperclip className="w-3 h-3 text-slate-400" />
                      <span>{msg.attachments.length} attachment(s)</span>
                    </div>
                  )}
                </div>

                {/* Unread indicator */}
                {!msg.isRead && (
                  <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0 mt-1.5 shadow-sm shadow-sky-400" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
