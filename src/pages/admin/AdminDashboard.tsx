/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  CreditCard,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  UserPlus,
  FileCheck2,
  Receipt,
  FileSpreadsheet,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import { getAdminKPIs, getAuditLogs, getDefaulterStudents } from '../../services/api';
import { formatPKR, formatDate } from '../../utils/formatters';
import { AuditLogEntry } from '../../types';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminKPIs(), getAuditLogs(), getDefaulterStudents(75)]).then(
      ([kpiData, logs, defData]) => {
        setKpis(kpiData);
        setAuditLogs(logs.slice(0, 6));
        setDefaulters(defData.slice(0, 4));
        setLoading(false);
      }
    );
  }, []);

  // 14-day attendance trend data
  const attendanceTrendData = [
    { day: 'Oct 12', rate: 94 },
    { day: 'Oct 13', rate: 92 },
    { day: 'Oct 14', rate: 95 },
    { day: 'Oct 15', rate: 89 },
    { day: 'Oct 16', rate: 93 },
    { day: 'Oct 19', rate: 96 },
    { day: 'Oct 20', rate: 94 },
    { day: 'Oct 21', rate: 91 },
    { day: 'Oct 22', rate: 93 },
    { day: 'Oct 23', rate: 95 },
    { day: 'Oct 26', rate: 94 },
  ];

  // Fee collection comparison
  const feeMonthlyData = [
    { month: 'Jun', collected: 1120000, target: 1200000 },
    { month: 'Jul', collected: 1180000, target: 1200000 },
    { month: 'Aug', collected: 1240000, target: 1250000 },
    { month: 'Sep', collected: 1210000, target: 1250000 },
    { month: 'Oct', collected: kpis?.collectedThisMonth || 890000, target: 1250000 },
  ];

  // Class performance scores
  const classPerformanceData = [
    { className: 'Class 6', average: 78.4 },
    { className: 'Class 7', average: 81.2 },
    { className: 'Class 8', average: 76.9 },
    { className: 'Class 9', average: 83.5 },
    { className: 'Class 10', average: 85.1 },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-neutral-200 dark:bg-[#121933] rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-neutral-200 dark:bg-[#121933] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-indigo-900 via-[#1A2347] to-[#121933] border border-[#242E56] text-white shadow-xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-teal-300 text-xs font-semibold mb-2 border border-indigo-400/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Academic Session 2026-2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Sora'] tracking-tight">
              Institutional Operations Command
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl">
              Welcome back, Administrator. All academic cohorts, fee reconciliations, and attendance registers are synchronized.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              onClick={() => navigate('/admin/students?action=new')}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-2 transition-transform active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>Admit Student</span>
            </button>
            <button
              onClick={() => navigate('/admin/attendance')}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-sm flex items-center gap-2 transition-transform active:scale-95"
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Mark Register</span>
            </button>
            <button
              onClick={() => navigate('/admin/fees')}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 transition-colors"
            >
              <Receipt className="w-4 h-4" />
              <span>Issue Vouchers</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Total Enrolled</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono-numbers text-neutral-900 dark:text-white">
              {kpis.totalStudents}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>100% Active across 10 sections</span>
            </div>
          </div>
        </div>

        {/* Today's Attendance */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Daily Attendance</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-500">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono-numbers text-neutral-900 dark:text-white">
              {kpis.attendancePercent}%
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>High cohort engagement</span>
            </div>
          </div>
        </div>

        {/* Fee Collected This Month */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">October Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-mono-numbers text-neutral-900 dark:text-white truncate">
              {formatPKR(kpis.collectedThisMonth)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
              <span>Rec: 60 enrolled students</span>
            </div>
          </div>
        </div>

        {/* Outstanding Dues */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs hover:border-indigo-500/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Outstanding Dues</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold font-mono-numbers text-amber-600 dark:text-amber-400 truncate">
              {formatPKR(kpis.outstandingDues)}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400">
              <span>{kpis.overdueCount} vouchers overdue</span>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Predictive & Early-Warning Insights */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
              Intelligent Institutional Insights
            </h3>
          </div>
          <span className="text-[11px] text-neutral-400">Rule-based analytical engine</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.insights.map((insight: any, idx: number) => {
            const borderColors = {
              warning: 'border-amber-500/30 bg-amber-500/5',
              alert: 'border-rose-500/30 bg-rose-500/5',
              success: 'border-emerald-500/30 bg-emerald-500/5',
              info: 'border-indigo-500/30 bg-indigo-500/5',
            }[insight.type as 'warning' | 'alert' | 'success' | 'info'];

            const textColors = {
              warning: 'text-amber-600 dark:text-amber-400',
              alert: 'text-rose-600 dark:text-rose-400',
              success: 'text-emerald-600 dark:text-emerald-400',
              info: 'text-indigo-600 dark:text-indigo-400',
            }[insight.type as 'warning' | 'alert' | 'success' | 'info'];

            return (
              <div key={idx} className={`p-3.5 rounded-xl border ${borderColors} space-y-1`}>
                <div className={`font-semibold text-xs ${textColors}`}>
                  {insight.title}
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {insight.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Section: Attendance Trend & Revenue Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Area Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                Daily Attendance Trend (%)
              </h3>
              <p className="text-[11px] text-neutral-500">Trailing two-week academic presence</p>
            </div>
            <button
              onClick={() => navigate('/admin/attendance')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Detailed Register</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis domain={[80, 100]} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121933',
                    border: '1px solid #242E56',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Attendance']}
                />
                <Area type="monotone" dataKey="rate" stroke="#14B8A6" strokeWidth={2.5} fillOpacity={1} fill="url(#attGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fee Collection Bar Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                Monthly Fee Realization (PKR)
              </h3>
              <p className="text-[11px] text-neutral-500">Collected vs Projected target by session</p>
            </div>
            <button
              onClick={() => navigate('/admin/fees')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Vouchers</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={feeMonthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#121933',
                    border: '1px solid #242E56',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [formatPKR(val), 'Amount']}
                />
                <Bar dataKey="target" fill="#64748B" opacity={0.25} radius={[4, 4, 0, 0]} name="Target" />
                <Bar dataKey="collected" fill="#3B3FD8" radius={[4, 4, 0, 0]} name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Row: Defaulters Warning & Real-time Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Defaulters List */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                Attendance Watchlist
              </h3>
            </div>
            <span className="text-[11px] font-mono text-rose-500">&lt; 75% Threshold</span>
          </div>

          <div className="space-y-3">
            {defaulters.length === 0 ? (
              <div className="text-xs text-neutral-500 p-4 text-center">
                All students meeting minimum 75% attendance criterion.
              </div>
            ) : (
              defaulters.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate(`/admin/students/${item.student.id}`)}
                  className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1A2347] border border-neutral-200 dark:border-[#242E56] hover:border-indigo-500/50 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-xs text-neutral-900 dark:text-white">
                      {item.student.fullName}
                    </div>
                    <div className="text-[11px] text-neutral-500">
                      {item.className} · Roll {item.student.rollNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs text-rose-600 dark:text-rose-400">
                      {item.attendanceRate}%
                    </span>
                    <div className="text-[10px] text-neutral-400">
                      {item.presentDays}/{item.totalDays} days
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit Log Feed */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                Institutional Activity & Audit Log
              </h3>
            </div>
            <button
              onClick={() => navigate('/admin/settings')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Full Log
            </button>
          </div>

          <div className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900 dark:text-white font-mono text-[11px]">
                      {log.action}
                    </span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-neutral-500">{log.module}</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                    {log.details}
                  </p>
                </div>
                <div className="text-right shrink-0 text-[10px] text-neutral-400 font-mono">
                  {formatDate(log.timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
