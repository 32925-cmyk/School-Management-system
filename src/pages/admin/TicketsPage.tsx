/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  MessageSquare,
  Send,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { getSupportTickets, addTicketMessage, getStudents } from '../../services/api';
import { SupportTicket, Student } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const TicketsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [t, s] = await Promise.all([getSupportTickets(), getStudents()]);
    setTickets(t);
    setStudents(s);
    if (t.length > 0 && !selectedTicketId) {
      setSelectedTicketId(t[0].id);
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
      showSuccess('Reply Sent', 'Message dispatched to student.');
      loadData();
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);
  const student = students.find((s) => s.id === selectedTicket?.studentId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
          Support Inquiries & Direct Messaging
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Coordinate official correspondence, resolve parent/student tickets, and provide guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Ticket List */}
        <div className="rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] overflow-y-auto divide-y divide-neutral-100 dark:divide-[#1A2347]">
          {tickets.map((t) => {
            const stu = students.find((s) => s.id === t.studentId);
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
                    {stu?.fullName || 'Student'}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-400">{formatDate(t.createdAt)}</span>
                </div>
                <div className="text-xs font-medium text-indigo-600 dark:text-teal-400 line-clamp-1">
                  {t.subject}
                </div>
                <div className="text-[11px] text-neutral-500 line-clamp-1 mt-1">
                  {t.messages[t.messages.length - 1]?.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Thread */}
        <div className="lg:col-span-2 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] flex flex-col justify-between overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-neutral-200 dark:border-[#242E56] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                    {selectedTicket.subject}
                  </h3>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Category: {selectedTicket.category} · Status: {selectedTicket.status}
                  </div>
                </div>
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {student?.fullName} ({student?.rollNumber})
                </span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {selectedTicket.messages.map((m) => {
                  const isAdmin = m.senderRole === 'ADMIN';

                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-1">
                        <span>{m.senderName}</span>
                        <span>·</span>
                        <span>{formatDate(m.timestamp)}</span>
                      </div>
                      <div
                        className={`p-3 rounded-2xl text-xs max-w-md ${
                          isAdmin
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

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-neutral-200 dark:border-[#242E56] flex gap-2">
                <input
                  type="text"
                  placeholder="Type official administrative reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-transform active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-neutral-400">
              Select a conversation thread to view correspondence.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
