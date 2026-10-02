'use client';

import React from 'react';
import { Mail, Trash2, Check, Plus, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface MultiMailboxDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  mailboxes: Array<{ address: string; id: string }>;
  currentAddress: string;
  onSelectAddress: (address: string, id: string) => void;
  onDeleteAddress: (address: string, id: string) => void;
  onNewAddress: () => void;
}

export const MultiMailboxDrawer: React.FC<MultiMailboxDrawerProps> = ({
  isOpen,
  onClose,
  mailboxes,
  currentAddress,
  onSelectAddress,
  onDeleteAddress,
  onNewAddress,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-sm bg-slate-900 border-l border-slate-800 h-full p-6 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="font-semibold text-white text-base">Active Mailboxes</h3>
            <p className="text-xs text-slate-400 mt-0.5">Switch between disposable addresses</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            &times;
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-2">
          {mailboxes.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No additional mailboxes saved in this session.
            </div>
          ) : (
            mailboxes.map((item) => {
              const isCurrent = item.address.toLowerCase() === currentAddress.toLowerCase();
              return (
                <div
                  key={item.address}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    onClick={() => {
                      onSelectAddress(item.address, item.id);
                      onClose();
                    }}
                    className="flex-1 text-left min-w-0 pr-2"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span className="text-xs font-mono font-medium text-slate-200 truncate block">
                        {item.address}
                      </span>
                    </div>
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-indigo-400 mt-1 font-sans">
                        <Check className="w-3 h-3" /> Active Inbox
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => onDeleteAddress(item.address, item.id)}
                    title="Remove address"
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        <div className="pt-4 border-t border-slate-800">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={() => {
              onNewAddress();
              onClose();
            }}
          >
            <Plus className="w-4 h-4" /> Create Another Mailbox
          </Button>
        </div>
      </div>
    </div>
  );
};
