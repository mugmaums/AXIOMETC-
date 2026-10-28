import React from 'react';
import { X, MessageSquare, Mail, Calendar, User } from 'lucide-react';
import type { VisitorMessage } from '../types';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: VisitorMessage[];
}

export const InboxModal: React.FC<InboxModalProps> = ({
  isOpen,
  onClose,
  messages,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#121620] border border-neutral-700/80 rounded-2xl shadow-2xl p-6 text-neutral-100 my-8">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Visitor Transmissions</h3>
              <p className="text-xs text-neutral-400">
                Inquiries and messages received live via active contact buttons
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-neutral-500 text-xs">
              No visitor transmissions recorded yet. Active contact buttons allow visitors to send direct dispatches.
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className="p-4 bg-[#0a0d14] border border-neutral-800 rounded-xl space-y-2 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <div className="flex items-center gap-2 font-medium text-neutral-200">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>{msg.name}</span>
                    {msg.email && (
                      <span className="flex items-center gap-1 text-neutral-400 font-mono text-[11px]">
                        <Mail className="w-3 h-3 text-neutral-500" />
                        {msg.email}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="w-3 h-3 text-neutral-500" />
                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line pt-1 border-t border-neutral-850">
                  {msg.message}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-neutral-800 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Close Inbox
          </button>
        </div>
      </div>
    </div>
  );
};
