/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Plus,
  Users,
  BookOpen,
  DoorOpen,
  UserCheck,
  X,
} from 'lucide-react';
import { getClasses, getTeachers, getSubjects, createClass, createSection } from '../../services/api';
import { SchoolClass, Teacher, Subject } from '../../types';
import { useToast } from '../../context/ToastContext';

export const ClassesSectionsPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [selectedClassForSection, setSelectedClassForSection] = useState<string>('');

  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState(11);

  const [newSectionName, setNewSectionName] = useState('Section C');
  const [newSectionCapacity, setNewSectionCapacity] = useState(30);
  const [newSectionRoom, setNewSectionRoom] = useState('Room 303');
  const [newSectionTeacherId, setNewSectionTeacherId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cls, tch, sub] = await Promise.all([getClasses(), getTeachers(), getSubjects()]);
      setClasses(cls);
      setTeachers(tch);
      setSubjects(sub);
      if (tch.length > 0) setNewSectionTeacherId(tch[0].id);
      if (cls.length > 0) setSelectedClassForSection(cls[0].id);
    } catch (err: any) {
      showError('Failed to load data', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClass(newClassName, Number(newClassGrade));
      showSuccess('Class Added', `Academic Class "${newClassName}" registered.`);
      setIsClassModalOpen(false);
      setNewClassName('');
      loadData();
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSection(
        selectedClassForSection,
        newSectionName,
        Number(newSectionCapacity),
        newSectionRoom,
        newSectionTeacherId
      );
      showSuccess('Section Added', `Section "${newSectionName}" created.`);
      setIsSectionModalOpen(false);
      loadData();
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  if (loading) {
    return <div className="h-64 rounded-2xl bg-neutral-200 dark:bg-[#121933] animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            Classes & Academic Sections
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Configure institutional cohorts, classroom capacities, section supervisors, and subject assignments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsClassModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-sm transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class</span>
          </button>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map((cls) => {
          const classSubjects = subjects.filter((s) => s.classId === cls.id);

          return (
            <div
              key={cls.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#1A2347] pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base font-['Sora'] text-neutral-900 dark:text-white">
                        {cls.name}
                      </h3>
                      <span className="text-[11px] text-neutral-400">Grade Level {cls.numericGrade}</span>
                    </div>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-[#1A2347] text-neutral-600 dark:text-neutral-300">
                    {cls.sections.length} Sections
                  </span>
                </div>

                {/* Sections List */}
                <div className="mt-4 space-y-2.5">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block">
                    Sections & Form Tutors
                  </span>
                  {cls.sections.map((sec) => {
                    const tutor = teachers.find((t) => t.id === sec.classTeacherId);

                    return (
                      <div
                        key={sec.id}
                        className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#1A2347] border border-neutral-200 dark:border-[#242E56] text-xs flex items-center justify-between"
                      >
                        <div>
                          <div className="font-semibold text-neutral-900 dark:text-white">
                            {sec.name} ({sec.roomNumber})
                          </div>
                          <div className="text-[11px] text-teal-600 dark:text-teal-400">
                            Tutor: {tutor?.fullName || 'Senior Faculty'}
                          </div>
                        </div>
                        <div className="text-right font-mono text-[11px] text-neutral-400">
                          Cap: {sec.capacity}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Curriculum Subjects overview */}
                <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-[#1A2347]">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
                    Active Curriculum ({classSubjects.length} Subjects)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {classSubjects.slice(0, 6).map((sub) => (
                      <span
                        key={sub.id}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-[#0B1020] text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-[#242E56]"
                      >
                        {sub.name}
                      </span>
                    ))}
                    {classSubjects.length > 6 && (
                      <span className="text-[10px] px-1.5 py-0.5 text-neutral-400">
                        +{classSubjects.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setSelectedClassForSection(cls.id);
                    setIsSectionModalOpen(true);
                  }}
                  className="w-full py-2 text-xs font-semibold rounded-xl border border-dashed border-neutral-300 dark:border-[#242E56] hover:border-indigo-500 text-neutral-600 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-teal-400 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Section to {cls.name}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE CLASS MODAL */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">Create Academic Class</h3>
            <form onSubmit={handleCreateClass} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Class 11"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Numeric Grade</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={12}
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE SECTION MODAL */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">Add Academic Section</h3>
            <form onSubmit={handleCreateSection} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Section Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Section C"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Room Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Room 205"
                  value={newSectionRoom}
                  onChange={(e) => setNewSectionRoom(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Student Capacity</label>
                <input
                  type="number"
                  required
                  value={newSectionCapacity}
                  onChange={(e) => setNewSectionCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Class Teacher / Tutor</label>
                <select
                  value={newSectionTeacherId}
                  onChange={(e) => setNewSectionTeacherId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.designation})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
