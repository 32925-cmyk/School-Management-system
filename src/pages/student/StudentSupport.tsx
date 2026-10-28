/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Plus,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  X,
} from 'lucide-react';
import { getSupportTickets, createSupportTicket, addTicketMessage } from '../../services/api';
import { SupportTicket } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const StudentSupport: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // New Ticket Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicket['category']>('ACADEMIC');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadTickets();
  }, [currentUser]);

  const loadTickets = async () => {
    if (!currentUser) return;
    const t = await getSupportTickets(currentUser.id);
    setTickets(t);
    if (t.length > 0 && !selectedTicketId) {
      setSelectedTicketId(t[0].id);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await createSupportTicket(currentUser.id, subject, category, message, currentUser.fullName);
      showSuccess('Inquiry Dispatched', 'Your ticket has been sent to the Administrative Directorate.');
      setIsModalOpen(false);
      setSubject('');
      setMessage('');
      loadTickets();
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyText.trim() || !currentUser) return;
    try {
      await addTicketMessage(selectedTicketId, replyText, {
        id: currentUser.id,
        name: currentUser.fullName,
        role: currentUser.role,
      });
      setReplyText('');
      loadTickets();
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            Support Desk & Administrative Inquiries
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Submit formal requests to the bursar, transport office, or academic registrars.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Raise New Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[550px]">
        {/* Ticket List */}
        <div className="rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] overflow-y-auto divide-y divide-neutral-100 dark:divide-[#1A2347]">
          {tickets.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-400">
              No support tickets raised yet.
            </div>
          ) : (
            tickets.map((t) => {
              const isSelected = t.id === selectedTicketId;

              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-4 cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/30 border-l-4 border-l-indigo-600'
                      : 'hover:bg-neutral-50/70 dark:hover:bg-[#1A2347]/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-neutral-900 dark:text-white truncate">
                      {t.subject}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">{formatDate(t.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-neutral-100 dark:bg-[#0B1020] text-neutral-400">
                      {t.category}
                    </span>
                    <span className="text-[10px] text-teal-400 font-semibold">{t.status}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] flex flex-col justify-between overflow-hidden">
          {selectedTicket ? (
            <>
              <div className="p-4 border-b border-neutral-200 dark:border-[#242E56] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                    {selectedTicket.subject}
                  </h3>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Category: {selectedTicket.category} · Status: {selectedTicket.status}
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {selectedTicket.messages.map((m) => {
                  const isStudent = m.senderRole === 'STUDENT';

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isStudent ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-1">
                        <span>{m.senderName}</span>
                        <span>·</span>
                        <span>{formatDate(m.timestamp)}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs max-w-md ${
                          isStudent
                            ? 'bg-indigo-600 text-white rounded-tr-xs'
                            : 'bg-neutral-100 dark:bg-[#1A2347] text-neutral-900 dark:text-white rounded-tl-xs'
                        }`}
                      >
                        {m.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              <form onSubmit={handleSendReply} className="p-3 border-t border-neutral-200 dark:border-[#242E56] flex gap-2">
                <input
                  type="text"
                  placeholder="Type follow-up inquiry..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] text-neutral-900 dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-neutral-400">
              Select or raise a ticket to view conversation.
            </div>
          )}
        </div>
      </div>

      {/* CREATE TICKET MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">Raise Support Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Inquiry Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Request for Lab Locker Assignment"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Department</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                >
                  <option value="ACADEMIC">Academic Administration</option>
                  <option value="FEES">Bursar & Fee Reconciliation</option>
                  <option value="TRANSPORT">Transit & Fleet Department</option>
                  <option value="LIBRARY">Library Circulation</option>
                  <option value="GENERAL">General Welfare</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Detailed Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your inquiry or request in detail..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
