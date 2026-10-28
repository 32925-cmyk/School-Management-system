/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  MessageSquare,
  X,
} from 'lucide-react';
import { getLeaveRequests, reviewLeaveRequest, getStudents } from '../../services/api';
import { LeaveRequest, Student } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LeaveRequestsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [reviewModalLeave, setReviewModalLeave] = useState<LeaveRequest | null>(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [l, s] = await Promise.all([getLeaveRequests(), getStudents()]);
    setLeaves(l);
    setStudents(s);
  };

  const handleReviewAction = async (status: 'APPROVED' | 'REJECTED') => {
    if (!reviewModalLeave || !currentUser) return;
    try {
      await reviewLeaveRequest(
        reviewModalLeave.id,
        status,
        remarks || (status === 'APPROVED' ? 'Sanctioned by Academic Head' : 'Attendance requirement unmet'),
        currentUser
      );
      showSuccess(
        `Leave ${status}`,
        `Application ${status.toLowerCase()}. Attendance register automatically synchronized.`
      );
      setReviewModalLeave(null);
      setRemarks('');
      loadData();
    } catch (err: any) {
      showError('Action Failed', err.message);
    }
  };

  const filteredLeaves = leaves.filter((l) => {
    if (selectedStatus === 'ALL') return true;
    return l.status === selectedStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            Leave Applications & Sanctions
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Review student absence applications. Approved leave automatically updates official attendance registers.
          </p>
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-[#242E56] bg-white dark:bg-[#121933] text-neutral-900 dark:text-white focus:outline-none"
        >
          <option value="ALL">All Application States</option>
          <option value="PENDING">Pending Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Grid */}
      <div className="rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-[#0E152B] border-b border-neutral-200 dark:border-[#242E56] text-neutral-500 font-semibold select-none">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Leave Window</th>
                <th className="py-3 px-4">Stated Reason</th>
                <th className="py-3 px-4">Submission Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
              {filteredLeaves.map((lv) => {
                const stu = students.find((s) => s.id === lv.studentId);

                return (
                  <tr key={lv.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1A2347]/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900 dark:text-white">{stu?.fullName || lv.studentId}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{stu?.rollNumber} · {stu?.classId}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {formatDate(lv.startDate)} {lv.startDate !== lv.endDate && `to ${formatDate(lv.endDate)}`}
                    </td>
                    <td className="py-3 px-4 text-neutral-600 dark:text-neutral-300 max-w-xs">
                      {lv.reason}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-neutral-400">
                      {formatDate(lv.submittedAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          lv.status === 'APPROVED'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : lv.status === 'REJECTED'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {lv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {lv.status === 'PENDING' ? (
                        <button
                          onClick={() => {
                            setReviewModalLeave(lv);
                            setRemarks('');
                          }}
                          className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                        >
                          Review & Decide
                        </button>
                      ) : (
                        <span className="text-[11px] text-neutral-400 italic">
                          {lv.adminRemarks || 'Reviewed'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* REVIEW MODAL */}
      {reviewModalLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">Decide Leave Application</h3>
            <div className="p-3 bg-neutral-50 dark:bg-[#0B1020] rounded-xl text-xs space-y-1">
              <div>Window: <strong>{formatDate(reviewModalLeave.startDate)} to {formatDate(reviewModalLeave.endDate)}</strong></div>
              <p className="text-neutral-500 italic">"{reviewModalLeave.reason}"</p>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Directorate Remarks</label>
              <input
                type="text"
                placeholder="e.g. Sanctioned with note to submit assignments on return."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
              />
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-neutral-100 dark:border-[#1A2347]">
              <button
                type="button"
                onClick={() => setReviewModalLeave(null)}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleReviewAction('REJECTED')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 hover:bg-rose-500 text-white"
                >
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleReviewAction('APPROVED')}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Approve Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
