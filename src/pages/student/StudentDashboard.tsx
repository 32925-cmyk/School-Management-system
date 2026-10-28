/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarCheck,
  CreditCard,
  BookMarked,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  Bell,
  Calendar,
  Flame,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getStudentKPIs, getTimetable, getNotices, getEvents } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatPKR, formatDate } from '../../utils/formatters';

export const StudentDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [kpis, setKpis] = useState<any>(null);
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      Promise.all([
        getStudentKPIs(currentUser.id),
        getTimetable('cls-10', 'sec-10-a'),
        getNotices('cls-10', currentUser.id),
        getEvents(),
      ]).then(([kpiData, tt, n, ev]) => {
        setKpis(kpiData);
        // Filter timetable for Monday / today
        setTodaySchedule(tt.filter((s: any) => s.dayOfWeek === 'Monday').slice(0, 4));
        setNotices(n.slice(0, 3));
        setEvents(ev.slice(0, 2));
        setLoading(false);
      });
    }
  }, [currentUser]);

  if (loading || !kpis) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-32 bg-neutral-200 dark:bg-[#121933] rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-neutral-200 dark:bg-[#121933] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-[#161F3E] to-[#121933] border border-[#242E56] text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2 border border-teal-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Distinction Track</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Sora'] tracking-tight">
              Assalam-o-Alaikum, {currentUser?.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl">
              Class 10 (Section A) · Roll <span className="font-mono text-amber-300">10A-01</span>. You have 2 classes scheduled this morning.
            </p>
          </div>

          {/* Gamification badge */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shrink-0">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-amber-200 font-bold">
                Attendance Streak
              </div>
              <div className="text-lg font-bold font-mono">18 Days Active</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Ring */}
        <div
          onClick={() => navigate('/student/attendance')}
          className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs hover:border-indigo-500/50 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Attendance Health</span>
            <CalendarCheck className="w-4 h-4 text-teal-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono-numbers text-neutral-900 dark:text-white">
              {kpis.attendanceRate}%
            </span>
            <span className="text-[11px] text-emerald-500 font-semibold">Good Standing</span>
          </div>
        </div>

        {/* Fees Status */}
        <div
          onClick={() => navigate('/student/fees')}
          className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs hover:border-indigo-500/50 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Outstanding Dues</span>
            <CreditCard className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-mono-numbers text-amber-600 dark:text-amber-400">
              {formatPKR(kpis.totalDues)}
            </div>
            <div className="mt-1 text-[11px] text-indigo-500 hover:underline flex items-center gap-1">
              <span>{kpis.totalDues > 0 ? 'Pay Now Online' : 'All Clear'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Pending Homework */}
        <div
          onClick={() => navigate('/student/homework')}
          className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs hover:border-indigo-500/50 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Coursework Tasks</span>
            <BookMarked className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono-numbers text-neutral-900 dark:text-white">
              {kpis.pendingAssignmentsCount} Pending
            </div>
            <div className="mt-1 text-[11px] text-neutral-400">Math & Physics labs due</div>
          </div>
        </div>

        {/* Latest GPA / Rank */}
        <div
          onClick={() => navigate('/student/results')}
          className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs hover:border-indigo-500/50 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Class Standing</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono-numbers text-neutral-900 dark:text-white">
              Rank #{kpis.latestResult?.classRank || 1}
            </div>
            <div className="mt-1 text-[11px] text-teal-400 font-mono">
              GPA {kpis.latestResult?.gpa || 3.8} / 4.0
            </div>
          </div>
        </div>
      </div>

      {/* Smart Predictive Insights for Student */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
            Your Academic Trajectory Insights
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {kpis.insights.map((ins: any, idx: number) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#1A2347] space-y-1"
            >
              <div className="font-semibold text-xs text-neutral-900 dark:text-white">{ins.title}</div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">{ins.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Today's Schedule + Notices Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                Today's Schedule
              </h3>
            </div>
            <button
              onClick={() => navigate('/student/timetable')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Week
            </button>
          </div>

          <div className="space-y-2.5">
            {todaySchedule.map((slot) => (
              <div
                key={slot.id}
                className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1A2347] border border-neutral-200 dark:border-[#242E56] flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-neutral-900 dark:text-white">{slot.subjectName}</div>
                  <div className="text-[11px] text-neutral-400">{slot.teacherName} · {slot.roomNumber}</div>
                </div>
                <span className="font-mono text-[11px] text-teal-600 dark:text-teal-400 font-semibold">
                  {slot.startTime}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notices & Circulars */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                Official Campus Notices & Circulars
              </h3>
            </div>
            <button
              onClick={() => navigate('/student/notices')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              All Circulars
            </button>
          </div>

          <div className="space-y-3">
            {notices.map((n) => (
              <div
                key={n.id}
                onClick={() => navigate('/student/notices')}
                className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#1A2347] border border-neutral-200 dark:border-[#242E56] hover:border-indigo-500 cursor-pointer transition-colors space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-neutral-900 dark:text-white">{n.title}</span>
                  <span className="text-[10px] font-mono text-neutral-400">{formatDate(n.publishDate)}</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                  {n.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
