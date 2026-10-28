/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BookMarked,
  Plus,
  Calendar,
  FileCheck2,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Send,
} from 'lucide-react';
import {
  getAssignments,
  getSubmissions,
  getClasses,
  getSubjects,
  createAssignment,
  gradeSubmission,
} from '../../services/api';
import { Assignment, AssignmentSubmission, SchoolClass, Subject } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export const HomeworkPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('cls-10');
  const [subjectId, setSubjectId] = useState('sub-10-math');
  const [dueDate, setDueDate] = useState('2026-11-04');
  const [maxScore, setMaxScore] = useState(25);

  // Grading Modal
  const [gradingSubm, setGradingSubm] = useState<AssignmentSubmission | null>(null);
  const [scoreInput, setScoreInput] = useState<number>(20);
  const [feedbackInput, setFeedbackInput] = useState('Well researched with clear steps.');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [asg, subm, cls, sub] = await Promise.all([
        getAssignments(),
        getSubmissions(),
        getClasses(),
        getSubjects(),
      ]);
      setAssignments(asg);
      setSubmissions(subm);
      setClasses(cls);
      setSubjects(sub);
      if (cls.length > 0) setClassId(cls[0].id);
      if (sub.length > 0) setSubjectId(sub[0].id);
    } catch (err: any) {
      showError('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await createAssignment(
        {
          title,
          description,
          classId,
          subjectId,
          assignedBy: currentUser.id,
          dueDate,
          maxScore: Number(maxScore),
        },
        currentUser
      );
      showSuccess('Homework Dispatched', `Assigned "${title}" to Class ${classId}.`);
      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      loadData();
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubm || !currentUser) return;
    try {
      await gradeSubmission(gradingSubm.id, Number(scoreInput), feedbackInput, currentUser);
      showSuccess('Evaluation Saved', `Submission graded with score ${scoreInput}.`);
      setGradingSubm(null);
      loadData();
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            Homework & Tasks Directorate
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Assign curriculum coursework, review student submission artifacts, and publish evaluative grading.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Homework Assignment</span>
        </button>
      </div>

      {/* Assignments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((asg) => {
          const asgSubmissions = submissions.filter((s) => s.assignmentId === asg.id);

          return (
            <div
              key={asg.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#1A2347] pb-3">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-teal-400 font-semibold">
                    {asg.classId} · Max {asg.maxScore} Pts
                  </span>
                  <span className="text-[11px] text-neutral-400">Due {formatDate(asg.dueDate)}</span>
                </div>

                <div className="mt-3 space-y-1.5">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                    {asg.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-3 leading-relaxed">
                    {asg.description}
                  </p>
                </div>
              </div>

              {/* Submissions summary */}
              <div className="pt-3 border-t border-neutral-100 dark:border-[#1A2347] space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Student Submissions:</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">
                    {asgSubmissions.length} Turned In
                  </span>
                </div>

                {asgSubmissions.map((subm) => (
                  <div
                    key={subm.id}
                    className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#1A2347] border border-neutral-200 dark:border-[#242E56] text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-white font-mono text-[11px]">
                        {subm.fileName || 'Online Response'}
                      </div>
                      <div className="text-[10px] text-neutral-400">{subm.status}</div>
                    </div>
                    <button
                      onClick={() => {
                        setGradingSubm(subm);
                        setScoreInput(subm.score ?? 20);
                        setFeedbackInput(subm.feedback || 'Well written with clear methodology.');
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                    >
                      {subm.score ? `Grade (${subm.score})` : 'Evaluate'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">Assign Homework Coursework</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chemical Equilibrium Equilibrium Constant Problems"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Target Class</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Subject</label>
                  <select
                    value={subjectId}
                    onChange={(e) => setSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Max Score</label>
                  <input
                    type="number"
                    required
                    value={maxScore}
                    onChange={(e) => setMaxScore(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Instructions / Description</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail expected exercises, questions, or derivation criteria..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Publish Homework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GRADING MODAL */}
      {gradingSubm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">Evaluate Submission</h3>
            <div className="p-3 bg-neutral-50 dark:bg-[#0B1020] rounded-xl text-xs space-y-1">
              <div>Attached File: <strong className="font-mono">{gradingSubm.fileName || 'Text Submission'}</strong></div>
              <p className="text-neutral-500 italic">"{gradingSubm.content}"</p>
            </div>
            <form onSubmit={handleSaveGrade} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Score Obtained</label>
                <input
                  type="number"
                  required
                  value={scoreInput}
                  onChange={(e) => setScoreInput(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Faculty Feedback</label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingSubm(null)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
