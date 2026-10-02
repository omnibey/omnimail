'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Copy, ExternalLink, QrCode } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  address: string;
}

export const QrCodeModal: React.FC<QrCodeModalProps> = ({ isOpen, onClose, address }) => {
  const { success } = useToast();
  const mailboxUrl = typeof window !== 'undefined' ? `${window.location.origin}?mailbox=${encodeURIComponent(address)}` : '';
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(mailboxUrl || address)}&bgcolor=0f172a&color=38bdf8`;

  const copyUrl = () => {
    navigator.clipboard.writeText(mailboxUrl);
    success('Mailbox URL copied to clipboard');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Mobile Mailbox Access"
      description="Scan this QR code with your phone camera to open this temporary inbox on mobile"
      maxWidth="sm"
    >
      <div className="flex flex-col items-center justify-center p-2 text-center">
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl shadow-inner mb-4 flex items-center justify-center min-h-[200px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrApiUrl}
            alt={`QR Code for ${address}`}
            width={200}
            height={200}
            className="rounded-lg shadow-sm"
          />
        </div>

        <div className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 mb-4 text-left">
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-1">Target Address</div>
          <div className="text-sm font-mono text-sky-400 truncate">{address}</div>
        </div>

        <div className="flex gap-2 w-full">
          <Button variant="secondary" size="sm" onClick={copyUrl} className="flex-1">
            <Copy className="w-3.5 h-3.5" /> Copy Link
          </Button>
          <Button variant="outline" size="sm" onClick={onClose} className="flex-1">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
