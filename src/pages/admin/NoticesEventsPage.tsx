/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  Plus,
  Pin,
  Trash2,
  CalendarDays,
  Sparkles,
  X,
} from 'lucide-react';
import {
  getNotices,
  createNotice,
  deleteNotice,
  getEvents,
  createEvent,
} from '../../services/api';
import { SchoolNotice, SchoolEvent } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const NoticesEventsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [notices, setNotices] = useState<SchoolNotice[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'notices' | 'events'>('notices');

  // New Notice Modal
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');
  const [noticeTarget, setNoticeTarget] = useState<'ALL' | 'CLASS' | 'STUDENT'>('ALL');
  const [noticePriority, setNoticePriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [isPinned, setIsPinned] = useState(false);

  // New Event Modal
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventType, setEventType] = useState<'ACADEMIC' | 'SPORTS' | 'PTM' | 'CULTURAL' | 'HOLIDAY'>('ACADEMIC');
  const [eventStart, setEventStart] = useState('2026-11-10');
  const [eventEnd, setEventEnd] = useState('2026-11-10');
  const [eventVenue, setEventVenue] = useState('Main Campus Auditorium');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [n, ev] = await Promise.all([getNotices(), getEvents()]);
    setNotices(n);
    setEvents(ev);
  };

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await createNotice(
        {
          title: noticeTitle,
          content: noticeContent,
          target: noticeTarget,
          priority: noticePriority,
          isPinned,
          authorName: currentUser.fullName,
        },
        currentUser
      );
      showSuccess('Notice Published', `Circular "${noticeTitle}" broadcast.`);
      setIsNoticeModalOpen(false);
      setNoticeTitle('');
      setNoticeContent('');
      loadData();
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    if (!currentUser) return;
    try {
      await deleteNotice(id, currentUser);
      showSuccess('Notice Removed', 'Archived announcement circular.');
      loadData();
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await createEvent(
        {
          title: eventTitle,
          description: eventDesc,
          type: eventType,
          startDate: eventStart,
          endDate: eventEnd,
          venue: eventVenue,
          allDay: true,
        },
        currentUser
      );
      showSuccess('Event Scheduled', `Added "${eventTitle}" to calendar.`);
      setIsEventModalOpen(false);
      setEventTitle('');
      setEventDesc('');
      loadData();
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            Announcements & Academic Calendar
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Publish institutional circulars, pin directives, and manage collegiate calendar milestones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {activeTab === 'notices' ? (
            <button
              onClick={() => setIsNoticeModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Circular</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEventModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Calendar Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-[#242E56] gap-4">
        <button
          onClick={() => setActiveTab('notices')}
          className={`flex items-center gap-2 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'notices'
              ? 'border-indigo-600 text-indigo-600 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-neutral-500 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Announcements & Circulars ({notices.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`flex items-center gap-2 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'events'
              ? 'border-indigo-600 text-indigo-600 dark:text-teal-400 dark:border-teal-400'
              : 'border-transparent text-neutral-500 hover:text-white'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Academic Calendar ({events.length})</span>
        </button>
      </div>

      {/* NOTICES LIST */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          {notices.map((n) => (
            <div
              key={n.id}
              className={`p-5 rounded-2xl bg-white dark:bg-[#121933] border ${
                n.isPinned
                  ? 'border-indigo-500/50 shadow-md shadow-indigo-500/5'
                  : 'border-neutral-200 dark:border-[#242E56]'
              } space-y-3`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2">
                  {n.isPinned && (
                    <span className="p-1 rounded bg-amber-500/10 text-amber-500" title="Pinned Directive">
                      <Pin className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                    {n.title}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
                      n.priority === 'URGENT'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        : n.priority === 'HIGH'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    }`}
                  >
                    {n.priority}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteNotice(n.id)}
                  className="p-1.5 text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#1A2347]"
                  title="Delete Circular"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {n.content}
              </p>

              <div className="pt-2 border-t border-neutral-100 dark:border-[#1A2347] flex items-center justify-between text-[11px] text-neutral-400">
                <span>Issued by: <strong>{n.authorName}</strong></span>
                <span>Target: <strong>{n.target}</strong> · Date: {formatDate(n.publishDate)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EVENTS CALENDAR LIST */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#1A2347] pb-2.5">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold">
                    {ev.type}
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">{formatDate(ev.startDate)}</span>
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {ev.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-100 dark:border-[#1A2347] text-[11px] text-neutral-400 flex items-center justify-between">
                <span>Venue: {ev.venue || 'Campus Wide'}</span>
                <span className="font-semibold text-indigo-500">Scheduled</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE NOTICE MODAL */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">Publish Circular Notice</h3>
            <form onSubmit={handleCreateNotice} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Notice Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Schedule of Term 2 Laboratory Practical Assessments"
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Target Audience</label>
                  <select
                    value={noticeTarget}
                    onChange={(e) => setNoticeTarget(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  >
                    <option value="ALL">All School (Campus-wide)</option>
                    <option value="CLASS">Class Specific</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Priority</label>
                  <select
                    value={noticePriority}
                    onChange={(e) => setNoticePriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent Directive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Detailed Circular Text</label>
                <textarea
                  required
                  rows={4}
                  value={noticeContent}
                  onChange={(e) => setNoticeContent(e.target.value)}
                  placeholder="Enter complete directive content for students and faculty..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Pin this circular to top of student feed</span>
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNoticeModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Publish Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EVENT MODAL */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">Schedule Calendar Event</h3>
            <form onSubmit={handleCreateEvent} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Event Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Iqbal Day Declamation Contest"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Event Category</label>
                  <select
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  >
                    <option value="ACADEMIC">Academic</option>
                    <option value="SPORTS">Sports & Athletics</option>
                    <option value="PTM">Parent-Teacher Conference</option>
                    <option value="CULTURAL">Cultural Celebration</option>
                    <option value="HOLIDAY">Public Holiday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={eventStart}
                    onChange={(e) => {
                      setEventStart(e.target.value);
                      setEventEnd(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Venue / Hall</label>
                <input
                  type="text"
                  value={eventVenue}
                  onChange={(e) => setEventVenue(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white"
                >
                  Confirm Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
