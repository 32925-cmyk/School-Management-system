/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users, BookOpen, CreditCard, Calendar, Library, Bus, FileText, X } from 'lucide-react';
import { getStudents, getClasses } from '../../services/api';
import { Student } from '../../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  role: 'ADMIN' | 'STUDENT';
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, role }) => {
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && role === 'ADMIN') {
      getStudents().then((data) => setStudents(data.slice(0, 40)));
    }
  }, [isOpen, role]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const adminNavLinks = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: BookOpen },
    { label: 'Student Directory & Admissions', path: '/admin/students', icon: Users },
    { label: 'Classes & Sections', path: '/admin/classes', icon: BookOpen },
    { label: 'Daily Attendance Register', path: '/admin/attendance', icon: Calendar },
    { label: 'Fee Management & Vouchers', path: '/admin/fees', icon: CreditCard },
    { label: 'Examinations & Report Cards', path: '/admin/exams', icon: FileText },
    { label: 'Class Timetable Builder', path: '/admin/timetable', icon: Calendar },
    { label: 'Library Catalogue & Circulation', path: '/admin/library', icon: Library },
    { label: 'Bus Routes & Transport', path: '/admin/transport', icon: Bus },
    { label: 'Institutional Settings & Backups', path: '/admin/settings', icon: FileText },
  ];

  const studentNavLinks = [
    { label: 'Student Portal Dashboard', path: '/student/dashboard', icon: BookOpen },
    { label: 'My Academic Profile', path: '/student/profile', icon: Users },
    { label: 'My Attendance Heatmap', path: '/student/attendance', icon: Calendar },
    { label: 'My Fee Vouchers & Online Pay', path: '/student/fees', icon: CreditCard },
    { label: 'Exam Results & Report Card', path: '/student/results', icon: FileText },
    { label: 'Weekly Timetable', path: '/student/timetable', icon: Calendar },
    { label: 'Homework & Submissions', path: '/student/homework', icon: BookOpen },
    { label: 'Library Books & Due Dates', path: '/student/library', icon: Library },
    { label: 'Bus Route & Pick-up Stop', path: '/student/transport', icon: Bus },
    { label: 'Notices & Circulars', path: '/student/notices', icon: FileText },
  ];

  const currentNav = role === 'ADMIN' ? adminNavLinks : studentNavLinks;

  const filteredNav = currentNav.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const filteredStudents = role === 'ADMIN'
    ? students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(query.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(query.toLowerCase()) ||
          s.email.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#121933] rounded-2xl shadow-2xl border border-neutral-200 dark:border-[#242E56] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-neutral-200 dark:border-[#242E56] gap-3">
          <Search className="w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder={role === 'ADMIN' ? 'Search pages, actions, or student names/roll numbers...' : 'Jump to portal features...'}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-neutral-900 dark:text-white placeholder-neutral-400 text-sm"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 rounded">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-neutral-100 dark:divide-[#1A2347]">
          {/* Navigation Items */}
          <div className="py-2">
            <div className="px-3 pb-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
              Navigation
            </div>
            {filteredNav.length === 0 ? (
              <div className="px-3 py-2 text-xs text-neutral-500">No matching sections</div>
            ) : (
              filteredNav.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => handleSelect(item.path)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#1A2347] transition-colors text-left"
                  >
                    <Icon className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Students (for Admin) */}
          {role === 'ADMIN' && query.trim().length > 0 && (
            <div className="py-2">
              <div className="px-3 pb-1 text-xs font-semibold text-neutral-400 uppercase tracking-wider font-['Plus_Jakarta_Sans']">
                Students
              </div>
              {filteredStudents.length === 0 ? (
                <div className="px-3 py-2 text-xs text-neutral-500">No students found</div>
              ) : (
                filteredStudents.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(`/admin/students/${s.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#1A2347] transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {s.fullName[0]}
                      </div>
                      <div>
                        <div className="font-medium text-neutral-900 dark:text-white leading-tight">{s.fullName}</div>
                        <div className="text-[11px] text-neutral-400">{s.email}</div>
                      </div>
                    </div>
                    <span className="font-mono text-xs text-neutral-400 dark:text-neutral-400">
                      {s.rollNumber}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-neutral-50 dark:bg-[#0B1020] border-t border-neutral-200 dark:border-[#242E56] text-[11px] text-neutral-400 flex items-center justify-between">
          <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-[10px]">Ctrl+K</kbd> anywhere</span>
          <span>Aurelian Heights Academy</span>
        </div>
      </div>
    </div>
  );
};
