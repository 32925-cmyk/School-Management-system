/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck2,
  AlertTriangle,
  Search,
  Save,
  Download,
  Users,
} from 'lucide-react';
import {
  getClasses,
  getStudents,
  getAttendanceByClassAndDate,
  markBatchAttendance,
  getDefaulterStudents,
} from '../../services/api';
import { SchoolClass, Student, AttendanceRecord, AttendanceStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const AttendancePage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('cls-10');
  const [selectedSectionId, setSelectedSectionId] = useState('sec-10-a');
  const [selectedDate, setSelectedDate] = useState('2026-10-26');

  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadClasses();
    loadDefaulters();
  }, []);

  useEffect(() => {
    if (selectedClassId && selectedSectionId) {
      loadClassAttendance();
    }
  }, [selectedClassId, selectedSectionId, selectedDate]);

  const loadClasses = async () => {
    const cls = await getClasses();
    setClasses(cls);
  };

  const loadDefaulters = async () => {
    const def = await getDefaulterStudents(75);
    setDefaulters(def);
  };

  const loadClassAttendance = async () => {
    try {
      setLoading(true);
      const [allStudents, existingRecords] = await Promise.all([
        getStudents({ classId: selectedClassId, sectionId: selectedSectionId }),
        getAttendanceByClassAndDate(selectedClassId, selectedSectionId, selectedDate),
      ]);

      setStudents(allStudents);

      const mapping: Record<string, { status: AttendanceStatus; remarks: string }> = {};
      allStudents.forEach((stu) => {
        const rec = existingRecords.find((r) => r.studentId === stu.id);
        mapping[stu.id] = {
          status: rec ? rec.status : 'PRESENT',
          remarks: rec?.remarks || '',
        };
      });
      setAttendanceMap(mapping);
    } catch (err: any) {
      showError('Failed to load register', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, { status: AttendanceStatus; remarks: string }> = {};
    students.forEach((stu) => {
      updated[stu.id] = {
        status,
        remarks: status === 'PRESENT' ? '' : attendanceMap[stu.id]?.remarks || '',
      };
    });
    setAttendanceMap(updated);
    showSuccess('Register Updated', `All ${students.length} students set to ${status}.`);
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const handleSaveRegister = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const recordsToSave = students.map((stu) => ({
        studentId: stu.id,
        status: attendanceMap[stu.id]?.status || 'PRESENT',
        remarks: attendanceMap[stu.id]?.remarks,
      }));

      await markBatchAttendance(
        selectedClassId,
        selectedSectionId,
        selectedDate,
        recordsToSave,
        currentUser
      );

      showSuccess(
        'Register Saved',
        `Attendance successfully recorded for ${students.length} students on ${selectedDate}.`
      );
      loadDefaulters();
    } catch (err: any) {
      showError('Save Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Metrics for today's register
  const presentCount = Object.values(attendanceMap).filter((v) => v.status === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter((v) => v.status === 'ABSENT').length;
  const lateCount = Object.values(attendanceMap).filter((v) => v.status === 'LATE').length;
  const leaveCount = Object.values(attendanceMap).filter((v) => v.status === 'LEAVE').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            Attendance Register & Vigilance
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Daily cohort attendance tracking with one-click presets, automatic student alerts, and threshold auditing.
          </p>
        </div>

        <button
          onClick={handleSaveRegister}
          disabled={isSaving}
          className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-sm transition-transform active:scale-95 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Recording...' : 'Save & Publish Register'}</span>
        </button>
      </div>

      {/* Control Strip & Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Controls Card */}
        <div className="lg:col-span-3 p-4 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Class */}
            <select
              value={selectedClassId}
              onChange={(e) => {
                setSelectedClassId(e.target.value);
                const cls = classes.find((c) => c.id === e.target.value);
                if (cls && cls.sections.length > 0) setSelectedSectionId(cls.sections[0].id);
              }}
              className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] text-neutral-900 dark:text-white font-medium focus:outline-none"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Section */}
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] text-neutral-900 dark:text-white font-medium focus:outline-none"
            >
              <option value="sec-10-a">Section A</option>
              <option value="sec-10-b">Section B</option>
            </select>

            {/* Date */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] text-neutral-900 dark:text-white font-mono focus:outline-none"
            />
          </div>

          {/* Quick Mark Presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-neutral-400 mr-1">Presets:</span>
            <button
              onClick={() => handleMarkAll('PRESENT')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20"
            >
              All Present
            </button>
            <button
              onClick={() => handleMarkAll('ABSENT')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 border border-rose-500/20"
            >
              All Absent
            </button>
          </div>
        </div>

        {/* Counter Summary */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs flex items-center justify-around text-center">
          <div>
            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-lg">
              {presentCount}
            </div>
            <div className="text-[10px] text-neutral-400">Present</div>
          </div>
          <div>
            <div className="font-mono font-bold text-rose-600 dark:text-rose-400 text-lg">
              {absentCount}
            </div>
            <div className="text-[10px] text-neutral-400">Absent</div>
          </div>
          <div>
            <div className="font-mono font-bold text-amber-600 dark:text-amber-400 text-lg">
              {lateCount}
            </div>
            <div className="text-[10px] text-neutral-400">Late</div>
          </div>
          <div>
            <div className="font-mono font-bold text-blue-600 dark:text-blue-400 text-lg">
              {leaveCount}
            </div>
            <div className="text-[10px] text-neutral-400">Leave</div>
          </div>
        </div>
      </div>

      {/* Main Student Register Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-[#0E152B] border-b border-neutral-200 dark:border-[#242E56] text-neutral-500 font-semibold select-none">
                <tr>
                  <th className="py-3 px-4">Roll</th>
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Attendance Status</th>
                  <th className="py-3 px-4">Remarks / Excuse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
                {students.map((stu) => {
                  const current = attendanceMap[stu.id] || { status: 'PRESENT', remarks: '' };

                  return (
                    <tr key={stu.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1A2347]/50">
                      <td className="py-3 px-4 font-mono font-semibold text-neutral-900 dark:text-white">
                        {stu.rollNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900 dark:text-white">{stu.fullName}</div>
                        <div className="text-[10px] text-neutral-400 font-mono">{stu.admissionNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="inline-flex rounded-xl bg-neutral-100 dark:bg-[#0B1020] p-1 border border-neutral-200 dark:border-[#242E56]">
                          {(['PRESENT', 'ABSENT', 'LATE', 'LEAVE'] as AttendanceStatus[]).map((st) => {
                            const isSelected = current.status === st;
                            const colors = {
                              PRESENT: isSelected ? 'bg-emerald-600 text-white' : 'text-neutral-500 hover:text-emerald-500',
                              ABSENT: isSelected ? 'bg-rose-600 text-white' : 'text-neutral-500 hover:text-rose-500',
                              LATE: isSelected ? 'bg-amber-600 text-white' : 'text-neutral-500 hover:text-amber-500',
                              LEAVE: isSelected ? 'bg-blue-600 text-white' : 'text-neutral-500 hover:text-blue-500',
                            }[st];

                            return (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleStatusChange(stu.id, st)}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${colors}`}
                              >
                                {st}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="e.g. Bus delay, medical reason..."
                          value={current.remarks || ''}
                          onChange={(e) => handleRemarksChange(stu.id, e.target.value)}
                          className="w-full px-2.5 py-1 text-xs rounded-lg border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] text-neutral-900 dark:text-white focus:outline-none"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Defaulters Watchlist Sidebar */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-sm font-['Sora'] text-neutral-900 dark:text-white">
                Defaulter Threshold
              </h3>
            </div>
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Students whose aggregate attendance falls below 75% are highlighted for guardian warnings prior to board mock exams.
            </p>

            <div className="space-y-2 pt-2">
              {defaulters.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1A2347] border border-neutral-200 dark:border-[#242E56] text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">{item.student.fullName}</div>
                    <div className="text-[10px] text-neutral-400">Roll: {item.student.rollNumber}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-rose-500">{item.attendanceRate}%</span>
                    <div className="text-[9px] text-neutral-400">{item.presentDays}/{item.totalDays} sessions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
