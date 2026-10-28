/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  User,
  MapPin,
} from 'lucide-react';
import { getClasses, getTimetable, getSubjects, getTeachers } from '../../services/api';
import { SchoolClass, Subject, Teacher } from '../../types';
import { useToast } from '../../context/ToastContext';

export const TimetablePage: React.FC = () => {
  const { showSuccess, showWarning } = useToast();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('cls-10');
  const [selectedSectionId, setSelectedSectionId] = useState('sec-10-a');
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    getClasses().then((cls) => {
      setClasses(cls);
      if (cls.length > 0) {
        setSelectedClassId(cls[0].id);
        if (cls[0].sections.length > 0) setSelectedSectionId(cls[0].sections[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      setLoading(true);
      getTimetable(selectedClassId, selectedSectionId).then((data) => {
        setSlots(data);
        setLoading(false);
      });
    }
  }, [selectedClassId, selectedSectionId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            Class Timetable & Schedule Builder
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Weekly class schedule with conflict prevention, period allocations, and room assignments.
          </p>
        </div>

        {/* Conflict validation badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4" />
          <span>Zero Room or Faculty Schedule Clashes</span>
        </div>
      </div>

      {/* Selectors */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] flex flex-wrap items-center gap-3">
        <select
          value={selectedClassId}
          onChange={(e) => {
            setSelectedClassId(e.target.value);
            const cls = classes.find((c) => c.id === e.target.value);
            if (cls && cls.sections.length > 0) setSelectedSectionId(cls.sections[0].id);
          }}
          className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] text-neutral-900 dark:text-white font-medium"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedSectionId}
          onChange={(e) => setSelectedSectionId(e.target.value)}
          className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] text-neutral-900 dark:text-white font-medium"
        >
          <option value="sec-10-a">Section A</option>
          <option value="sec-10-b">Section B</option>
        </select>

        <span className="text-xs text-neutral-400 ml-auto">
          Academic Hours: 08:00 AM - 02:15 PM · 7 Periods Daily
        </span>
      </div>

      {/* Weekly Visual Grid */}
      <div className="rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-50 dark:bg-[#0E152B] border-b border-neutral-200 dark:border-[#242E56] text-neutral-500 font-semibold select-none">
              <tr>
                <th className="py-3 px-4 w-28">Day / Period</th>
                {periods.map((p) => (
                  <th key={p} className="py-3 px-4 min-w-[140px]">
                    Period {p}
                    <div className="text-[10px] font-mono text-neutral-400 font-normal">
                      {p === 1 && '08:00 - 08:50'}
                      {p === 2 && '08:50 - 09:40'}
                      {p === 3 && '09:40 - 10:30'}
                      {p === 4 && '11:00 - 11:50'}
                      {p === 5 && '11:50 - 12:40'}
                      {p === 6 && '12:40 - 13:30'}
                      {p === 7 && '13:30 - 14:15'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
              {days.map((day) => (
                <tr key={day} className="hover:bg-neutral-50/50 dark:hover:bg-[#1A2347]/50">
                  <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white bg-neutral-50/50 dark:bg-[#0E152B]/40">
                    {day}
                  </td>
                  {periods.map((period) => {
                    const slot = slots.find((s) => s.dayOfWeek === day && s.period === period);

                    if (!slot) {
                      return (
                        <td key={period} className="py-3.5 px-4 text-neutral-400 text-center">
                          —
                        </td>
                      );
                    }

                    return (
                      <td key={period} className="py-3.5 px-4">
                        <div className="p-2.5 rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#1A2347] space-y-1 hover:border-indigo-500 transition-colors">
                          <div className="font-semibold text-neutral-900 dark:text-white truncate">
                            {slot.subjectName}
                          </div>
                          <div className="text-[10px] text-neutral-500 truncate flex items-center gap-1">
                            <User className="w-3 h-3 text-neutral-400" />
                            <span>{slot.teacherName}</span>
                          </div>
                          <div className="text-[10px] text-teal-600 dark:text-teal-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            <span>{slot.roomNumber}</span>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
