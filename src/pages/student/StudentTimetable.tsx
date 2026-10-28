/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Clock, MapPin, User, BookOpen } from 'lucide-react';
import { getTimetable } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const StudentTimetable: React.FC = () => {
  const { currentUser } = useAuth();
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [1, 2, 3, 4, 5, 6, 7];

  useEffect(() => {
    getTimetable('cls-10', 'sec-10-a').then((data) => {
      setSlots(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
          My Weekly Class Timetable
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Official academic period assignments for Class 10 (Section A) · Term 1.
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-neutral-50 dark:bg-[#0E152B] border-b border-neutral-200 dark:border-[#242E56] text-neutral-500 font-semibold select-none">
              <tr>
                <th className="py-3 px-4 w-28">Day / Period</th>
                {periods.map((p) => (
                  <th key={p} className="py-3 px-4 min-w-[130px]">
                    Period {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
              {days.map((day) => (
                <tr key={day} className="hover:bg-neutral-50/50 dark:hover:bg-[#1A2347]/50">
                  <td className="py-3 px-4 font-bold text-neutral-900 dark:text-white bg-neutral-50/50 dark:bg-[#0E152B]/40">
                    {day}
                  </td>
                  {periods.map((period) => {
                    const slot = slots.find((s) => s.dayOfWeek === day && s.period === period);

                    if (!slot) {
                      return <td key={period} className="py-3 px-4 text-neutral-400 text-center">—</td>;
                    }

                    return (
                      <td key={period} className="py-3 px-4">
                        <div className="p-2 rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#1A2347] space-y-1">
                          <div className="font-semibold text-neutral-900 dark:text-white truncate">
                            {slot.subjectName}
                          </div>
                          <div className="text-[10px] text-neutral-400 truncate flex items-center gap-1">
                            <User className="w-2.5 h-2.5" />
                            <span>{slot.teacherName}</span>
                          </div>
                          <div className="text-[10px] text-teal-400 font-mono">
                            {slot.roomNumber}
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
