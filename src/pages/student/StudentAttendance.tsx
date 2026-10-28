/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck2,
  AlertTriangle,
  Send,
  X,
} from 'lucide-react';
import {
  getStudentAttendanceHistory,
  submitLeaveRequest,
  getLeaveRequests,
} from '../../services/api';
import { AttendanceRecord, LeaveRequest } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const StudentAttendance: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  // Leave Form
  const [startDate, setStartDate] = useState('2026-10-30');
  const [endDate, setEndDate] = useState('2026-10-30');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, [currentUser]);

  const loadAttendance = async () => {
    if (!currentUser) return;
    const [att, lv] = await Promise.all([
      getStudentAttendanceHistory(currentUser.id),
      getLeaveRequests(),
    ]);
    setRecords(att);
    setLeaves(lv.filter((l) => l.studentId === currentUser.id));
  };

  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !reason.trim()) return;

    setIsSubmitting(true);
    try {
      await submitLeaveRequest(currentUser.id, startDate, endDate, reason);
      showSuccess('Application Submitted', 'Your leave request has been dispatched to the Academic Directorate.');
      setIsLeaveModalOpen(false);
      setReason('');
      loadAttendance();
    } catch (err: any) {
      showError('Submission Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Metrics
  const totalDays = records.length;
  const presentDays = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 95;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            My Attendance Record & Leave Desk
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Historical attendance sessions, cohort participation health, and sanctioned leave requests.
          </p>
        </div>

        <button
          onClick={() => setIsLeaveModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Apply for Official Leave</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs">
          <span className="text-xs font-semibold text-neutral-400">Aggregate Attendance Health</span>
          <div className="text-3xl font-bold font-mono-numbers text-teal-600 dark:text-teal-400 mt-2">
            {attendanceRate}%
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Exceeds 75% minimum board threshold</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs">
          <span className="text-xs font-semibold text-neutral-400">Sessions Attended</span>
          <div className="text-3xl font-bold font-mono-numbers text-neutral-900 dark:text-white mt-2">
            {presentDays} / {totalDays}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Official instructional days</p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs">
          <span className="text-xs font-semibold text-neutral-400">Sanctioned Leaves</span>
          <div className="text-3xl font-bold font-mono-numbers text-indigo-600 dark:text-teal-400 mt-2">
            {leaves.filter((l) => l.status === 'APPROVED').length} Approved
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">{leaves.filter((l) => l.status === 'PENDING').length} pending review</p>
        </div>
      </div>

      {/* Attendance Calendar Heatmap Simulation */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
            Attendance Heatmap (Past 30 Days)
          </h3>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Present</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-amber-500" /> Late</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-blue-500" /> Leave</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-rose-500" /> Absent</span>
          </div>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-15 gap-2 pt-2">
          {records.slice(0, 30).map((r) => {
            const bg = {
              PRESENT: 'bg-emerald-500 text-white',
              LATE: 'bg-amber-500 text-white',
              LEAVE: 'bg-blue-500 text-white',
              ABSENT: 'bg-rose-500 text-white',
            }[r.status];

            return (
              <div
                key={r.id}
                title={`${formatDate(r.date)}: ${r.status}`}
                className={`p-2 rounded-xl text-center font-mono font-bold text-xs ${bg} shadow-xs hover:scale-105 transition-transform cursor-pointer`}
              >
                <div className="text-[9px] opacity-80">{r.date.slice(8)}</div>
                <div className="text-[10px] mt-0.5">{r.status[0]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 dark:border-[#242E56] flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-neutral-400 font-['Sora']">
            Detailed Log Register
          </span>
          <span className="text-xs text-neutral-400">{records.length} Recorded Entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-[#0E152B] border-b border-neutral-200 dark:border-[#242E56] text-neutral-500 font-semibold select-none">
              <tr>
                <th className="py-3 px-4">Session Date</th>
                <th className="py-3 px-4">Attendance Status</th>
                <th className="py-3 px-4">Official Remarks</th>
                <th className="py-3 px-4">Recorded By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1A2347]/50">
                  <td className="py-3 px-4 font-mono font-semibold text-neutral-900 dark:text-white">
                    {formatDate(r.date)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.status === 'PRESENT'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : r.status === 'LATE'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : r.status === 'LEAVE'
                          ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-neutral-500">{r.remarks || 'Normal attendance session'}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">{r.markedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* APPLY LEAVE MODAL */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">Submit Leave Application</h3>
            <p className="text-xs text-neutral-500">
              Applications are reviewed by the Academic Dean. If approved, your attendance records will automatically reflect sanctioned leave.
            </p>
            <form onSubmit={handleApplyLeave} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Reason for Absence</label>
                <textarea
                  required
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Detail reason (e.g. Medical illness, emergency family event)..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit to Dean'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
