/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bell, Pin, Calendar, Sparkles } from 'lucide-react';
import { getNotices, getEvents } from '../../services/api';
import { SchoolNotice, SchoolEvent } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const StudentNotices: React.FC = () => {
  const { currentUser } = useAuth();
  const [notices, setNotices] = useState<SchoolNotice[]>([]);
  const [events, setEvents] = useState<SchoolEvent[]>([]);

  useEffect(() => {
    if (currentUser) {
      Promise.all([getNotices('cls-10', currentUser.id), getEvents()]).then(([n, ev]) => {
        setNotices(n);
        setEvents(ev);
      });
    }
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
          Campus Circulars & Official Events
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Direct institutional announcements, midterm instructions, and calendar milestones.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notices */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold font-['Sora'] text-neutral-900 dark:text-white flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-500" />
            <span>Academic Directives & Circulars</span>
          </h2>

          <div className="space-y-3">
            {notices.map((n) => (
              <div
                key={n.id}
                className={`p-5 rounded-2xl bg-white dark:bg-[#121933] border ${
                  n.isPinned
                    ? 'border-indigo-500/50 shadow-md shadow-indigo-500/5'
                    : 'border-neutral-200 dark:border-[#242E56]'
                } space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {n.isPinned && (
                      <span className="p-1 rounded bg-amber-500/10 text-amber-500">
                        <Pin className="w-3.5 h-3.5" />
                      </span>
                    )}
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                      {n.title}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">{formatDate(n.publishDate)}</span>
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {n.content}
                </p>
                <div className="pt-2 border-t border-neutral-100 dark:border-[#1A2347] text-[11px] text-neutral-400">
                  Authority: <strong>{n.authorName}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Events */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold font-['Sora'] text-neutral-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-400" />
            <span>Upcoming School Events</span>
          </h2>

          <div className="space-y-3">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="p-4 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{ev.type}</span>
                  <span className="font-mono text-[10px] text-neutral-400">{formatDate(ev.startDate)}</span>
                </div>
                <h4 className="font-bold text-xs text-neutral-900 dark:text-white font-['Sora']">
                  {ev.title}
                </h4>
                <p className="text-[11px] text-neutral-500 leading-relaxed">{ev.description}</p>
                <div className="text-[10px] text-neutral-400 pt-1">Venue: {ev.venue || 'Campus Wide'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
