/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Mail,
  Phone,
  GraduationCap,
  Award,
  Search,
  CheckCircle2,
  X,
} from 'lucide-react';
import { getTeachers, getSubjects, createTeacher } from '../../services/api';
import { Teacher, Subject } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { validatePakistaniPhone, formatDate } from '../../utils/formatters';

export const TeachersPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    qualification: '',
    specialization: '',
    designation: 'Senior Faculty',
    joiningDate: '2026-08-15',
    status: 'ACTIVE' as const,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tch, sub] = await Promise.all([getTeachers(), getSubjects()]);
      setTeachers(tch);
      setSubjects(sub);
    } catch (err: any) {
      showError('Failed to load faculty', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneVal = validatePakistaniPhone(formData.phone);

    try {
      await createTeacher(
        {
          ...formData,
          phone: phoneVal.formatted,
        },
        currentUser!
      );
      showSuccess('Faculty Member Added', `Registered ${formData.fullName} to instructional staff.`);
      setIsModalOpen(false);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        qualification: '',
        specialization: '',
        designation: 'Senior Faculty',
        joiningDate: '2026-08-15',
        status: 'ACTIVE',
      });
      loadData();
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.fullName.toLowerCase().includes(q) ||
      t.email.toLowerCase().includes(q) ||
      t.designation.toLowerCase().includes(q) ||
      t.specialization.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            Instructional Faculty & Staff
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Academic appointments, department heads, certifications, and teaching loads.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Appoint Faculty</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search faculty by name, department, or specialization..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Faculty Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeachers.map((tch) => {
          const taughtSubjects = subjects.filter((s) => s.teacherId === tch.id);

          return (
            <div
              key={tch.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                    {tch.fullName.replace(/(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s*/, '')[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                      {tch.fullName}
                    </h3>
                    <div className="text-xs text-indigo-600 dark:text-teal-400 font-medium">
                      {tch.designation}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{tch.qualification}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span className="truncate">{tch.specialization}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500">
                    <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{tch.email}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500">
                    <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{tch.phone}</span>
                  </div>
                </div>

                {/* Assigned Subjects */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-[#1A2347]">
                  <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Instructional Subjects ({taughtSubjects.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {taughtSubjects.map((s) => (
                      <span
                        key={s.id}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[#0B1020] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-[#242E56]"
                      >
                        {s.name} ({s.code})
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-neutral-400 flex items-center justify-between border-t border-neutral-100 dark:border-[#1A2347]">
                <span>Joined {formatDate(tch.joiningDate)}</span>
                <span className="font-semibold text-emerald-500">Active Faculty</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE FACULTY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base font-['Sora']">Appoint Faculty Member</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTeacher} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Full Name with Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Asadullah Niazi"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="asad.niazi@aurelianheights.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Pakistani Mobile</label>
                  <input
                    type="text"
                    required
                    placeholder="0300 5512391"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Highest Qualification</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ph.D. Applied Physics, NUST"
                  value={formData.qualification}
                  onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Specialization & Discipline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Optics & Condensed Matter"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save Faculty Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
