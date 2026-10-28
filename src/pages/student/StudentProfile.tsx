/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  KeyRound,
  MapPin,
  Phone,
  Mail,
  Calendar,
  ShieldCheck,
  Save,
  FolderOpen,
} from 'lucide-react';
import { getStudentById, updateStudent } from '../../services/api';
import { Student } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const StudentProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [address, setAddress] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser) {
      getStudentById(currentUser.id).then((s) => {
        if (s) {
          setStudent(s);
          setAddress(s.address);
        }
      });
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !currentUser) return;
    setIsSaving(true);
    try {
      await updateStudent(student.id, { address }, currentUser);
      showSuccess('Profile Updated', 'Residential address details saved.');
    } catch (err: any) {
      showError('Update Failed', err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!student) {
    return <div className="h-64 rounded-2xl bg-neutral-200 dark:bg-[#121933] animate-pulse" />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
          My Academic Profile & Credentials
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Registered institutional records, guardian contacts, and verified credentials.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-md border border-white/20 shrink-0">
          {student.fullName[0]}
        </div>
        <div>
          <h2 className="text-lg font-bold font-['Sora'] text-neutral-900 dark:text-white">
            {student.fullName}
          </h2>
          <div className="text-xs text-neutral-500 flex flex-wrap gap-x-4 gap-y-1 mt-1 font-mono">
            <span>Roll: <strong className="text-neutral-900 dark:text-white">{student.rollNumber}</strong></span>
            <span>Admission: {student.admissionNumber}</span>
            <span>Class: {student.classId}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="p-6 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs space-y-4">
        <h3 className="font-bold text-sm font-['Sora'] text-neutral-900 dark:text-white">
          Contact & Residential Information
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-neutral-400 mb-1">Email Address (Immutable)</label>
            <input
              type="text"
              disabled
              value={student.email}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-100 dark:bg-[#0B1020] text-neutral-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1">Registered Mobile (Immutable)</label>
            <input
              type="text"
              disabled
              value={student.phone}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-100 dark:bg-[#0B1020] text-neutral-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1">Father / Guardian</label>
            <input
              type="text"
              disabled
              value={student.guardianName}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-100 dark:bg-[#0B1020] text-neutral-500"
            />
          </div>
          <div>
            <label className="block text-neutral-400 mb-1">Guardian Emergency Contact</label>
            <input
              type="text"
              disabled
              value={student.guardianPhone}
              className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-100 dark:bg-[#0B1020] text-neutral-500 font-mono"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
              Residential Address (Editable)
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-100 dark:border-[#1A2347] flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Updating...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
