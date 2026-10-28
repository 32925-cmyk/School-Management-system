/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  CreditCard,
  Award,
  Users,
  Filter,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { getStudents, getFeeVouchers, getStudentResults } from '../../services/api';
import { formatPKR } from '../../utils/formatters';
import { useToast } from '../../context/ToastContext';

export const ReportsPage: React.FC = () => {
  const { showSuccess } = useToast();
  const [reportType, setReportType] = useState<'fees' | 'attendance' | 'results' | 'enrolment'>('fees');

  const gradeDistributionData = [
    { name: 'Grade A+', count: 18, color: '#22A06B' },
    { name: 'Grade A', count: 24, color: '#14B8A6' },
    { name: 'Grade B', count: 12, color: '#3B82F6' },
    { name: 'Grade C', count: 4, color: '#E5A00D' },
    { name: 'Grade D/F', count: 2, color: '#D64550' },
  ];

  const classEnrollmentData = [
    { class: 'Class 6', boys: 6, girls: 6, total: 12 },
    { class: 'Class 7', boys: 6, girls: 6, total: 12 },
    { class: 'Class 8', boys: 6, girls: 6, total: 12 },
    { class: 'Class 9', boys: 6, girls: 6, total: 12 },
    { class: 'Class 10', boys: 6, girls: 6, total: 12 },
  ];

  const handleExportReport = () => {
    showSuccess('Report Exported', `Generated formatted ${reportType.toUpperCase()} spreadsheet.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            Institutional Reports & Analytics
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Data visualization, cohort distribution metrics, and academic audit exports.
          </p>
        </div>

        <button
          onClick={handleExportReport}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export Analytics CSV</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-[#242E56] gap-4">
        {[
          { key: 'fees', label: 'Financial & Fee Realization', icon: CreditCard },
          { key: 'results', label: 'Academic Performance & Grades', icon: Award },
          { key: 'enrolment', label: 'Demographics & Enrolment', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setReportType(tab.key as any)}
              className={`flex items-center gap-2 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-teal-400 dark:border-teal-400'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* CHARTS */}
      {reportType === 'results' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora'] mb-1">
              Grade Distribution (Midterm Examinations 2026)
            </h3>
            <p className="text-xs text-neutral-500 mb-4">Percentage breakdown across board grading scale</p>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gradeDistributionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    innerRadius={50}
                    dataKey="count"
                    label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {gradeDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora'] mb-1">
                Executive Academic Commentary
              </h3>
              <p className="text-xs text-neutral-500 mb-4">Board examination readiness indicators</p>
              <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                <p>
                  • <strong>70% of enrolled students</strong> achieved Grade A or higher during the October mock term.
                </p>
                <p>
                  • Mathematics & Computer Sciences displayed the highest average scores (87.2%), reflecting rigorous STEM lab pedagogy.
                </p>
                <p>
                  • Remedial tutorials are actively organized for 2 students requiring progression support prior to FBISE board registrations.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-100 dark:border-[#1A2347] flex justify-between text-xs text-neutral-400">
              <span>Audited by: Academic Directorate</span>
              <span>October 2026</span>
            </div>
          </div>
        </div>
      )}

      {reportType === 'enrolment' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
            Enrolment Demographics Across Cohorts
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classEnrollmentData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="class" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="boys" fill="#3B3FD8" name="Male Students" radius={[4, 4, 0, 0]} />
                <Bar dataKey="girls" fill="#14B8A6" name="Female Students" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {reportType === 'fees' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
            Revenue Realization & Recovery Ledger
          </h3>
          <p className="text-xs text-neutral-500">
            Real-time reconciliation of issued vouchers, bank transfers, JazzCash merchant settlements, and cash counters.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1A2347]">
              <span className="text-[11px] text-neutral-400">Cash Counter Settlements</span>
              <div className="text-lg font-bold font-mono text-neutral-900 dark:text-white mt-1">PKR 340,000</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1A2347]">
              <span className="text-[11px] text-neutral-400">Online Gateways (Card/JazzCash)</span>
              <div className="text-lg font-bold font-mono text-teal-500 mt-1">PKR 550,000</div>
            </div>
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-[#1A2347]">
              <span className="text-[11px] text-neutral-400">Outstanding Overdue Defaulters</span>
              <div className="text-lg font-bold font-mono text-amber-500 mt-1">PKR 285,000</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
