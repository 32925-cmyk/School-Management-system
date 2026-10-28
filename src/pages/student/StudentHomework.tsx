/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  BookMarked,
  Upload,
  CheckCircle2,
  Clock,
  Sparkles,
  FileText,
  X,
  Send,
} from 'lucide-react';
import { getAssignments, getSubmissions, submitAssignment } from '../../services/api';
import { Assignment, AssignmentSubmission } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const StudentHomework: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [selectedAsgForSubmit, setSelectedAsgForSubmit] = useState<Assignment | null>(null);

  // Submit form state
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;
    const [asg, subm] = await Promise.all([
      getAssignments('cls-10'),
      getSubmissions(undefined, currentUser.id),
    ]);
    setAssignments(asg);
    setSubmissions(subm);
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsgForSubmit || !currentUser) return;
    setIsSubmitting(true);
    try {
      await submitAssignment(
        selectedAsgForSubmit.id,
        currentUser.id,
        content,
        fileName || 'assignment_turnin.pdf'
      );
      showSuccess('Coursework Submitted', 'Attached work sent to faculty instructor.');
      setSelectedAsgForSubmit(null);
      setContent('');
      setFileName('');
      loadData();
    } catch (err: any) {
      showError('Submission Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
          Homework & Coursework Submissions
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Review curriculum assignments, submit coursework artifacts, and view faculty appraisal scores.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map((asg) => {
          const submission = submissions.find((s) => s.assignmentId === asg.id);

          return (
            <div
              key={asg.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#1A2347] pb-3">
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-teal-400 font-semibold">
                    {asg.maxScore} Max Pts
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">Due {formatDate(asg.dueDate)}</span>
                </div>

                <div className="mt-3 space-y-1.5">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                    {asg.title}
                  </h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {asg.description}
                  </p>
                </div>
              </div>

              {/* Status & Feedback */}
              <div className="pt-3 border-t border-neutral-100 dark:border-[#1A2347] space-y-2">
                {submission ? (
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Turned In</span>
                      </span>
                      {submission.score !== undefined && (
                        <span className="font-mono font-bold text-indigo-600 dark:text-teal-400">
                          Score: {submission.score} / {asg.maxScore}
                        </span>
                      )}
                    </div>
                    {submission.feedback && (
                      <div className="p-2 rounded-lg bg-neutral-50 dark:bg-[#1A2347] text-[11px] text-neutral-500 italic">
                        "{submission.feedback}"
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedAsgForSubmit(asg);
                      setContent('');
                      setFileName('');
                    }}
                    className="w-full py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Submit Assignment</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* SUBMISSION MODAL */}
      {selectedAsgForSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">Submit Homework</h3>
            <div className="p-3 bg-neutral-50 dark:bg-[#0B1020] rounded-xl text-xs">
              <strong className="block text-indigo-500">{selectedAsgForSubmit.title}</strong>
              <span className="text-neutral-400 text-[11px]">Due on {formatDate(selectedAsgForSubmit.dueDate)}</span>
            </div>

            <form onSubmit={handleSubmitTask} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Upload Work / Artifact (PDF or Script)</label>
                <input
                  type="file"
                  onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
                  className="text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Online Notes / Solutions Text</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detail your answer, method derivation, or code snippet..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAsgForSubmit(null)}
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
                  <span>{isSubmitting ? 'Turning In...' : 'Confirm Submission'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
