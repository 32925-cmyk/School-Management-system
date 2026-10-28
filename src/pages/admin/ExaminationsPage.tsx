/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Award,
  CheckCircle2,
  Eye,
  Printer,
  Sparkles,
  Search,
  X,
  FileCheck2,
} from 'lucide-react';
import {
  getExams,
  getClasses,
  getSubjects,
  getStudents,
  getStudentResults,
  createExam,
  toggleExamPublish,
  saveStudentResult,
} from '../../services/api';
import { Exam, SchoolClass, Subject, Student, StudentExamResult } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Logo } from '../../components/common/Logo';

export const ExaminationsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<StudentExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Active view filters
  const [selectedExamId, setSelectedExamId] = useState('exam-02');
  const [selectedClassId, setSelectedClassId] = useState('cls-10');

  // Modals
  const [isCreateExamOpen, setIsCreateExamOpen] = useState(false);
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamStart, setNewExamStart] = useState('2026-11-15');
  const [newExamEnd, setNewExamEnd] = useState('2026-11-26');

  // Marks Entry Modal
  const [selectedStudentForMarks, setSelectedStudentForMarks] = useState<Student | null>(null);
  const [marksInput, setMarksInput] = useState<Record<string, number>>({});
  const [teacherRemarks, setTeacherRemarks] = useState('Exemplary mastery and intellectual discipline.');

  // Printable Report Card
  const [printableCard, setPrintableCard] = useState<{ result: StudentExamResult; student: Student } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedExamId && selectedClassId) {
      loadResults();
    }
  }, [selectedExamId, selectedClassId]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [ex, cls, sub, stu] = await Promise.all([
        getExams(),
        getClasses(),
        getSubjects(),
        getStudents(),
      ]);
      setExams(ex);
      setClasses(cls);
      setSubjects(sub);
      setStudents(stu);
      if (ex.length > 0) setSelectedExamId(ex[0].id);
      if (cls.length > 0) setSelectedClassId(cls[0].id);
    } catch (err: any) {
      showError('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadResults = async () => {
    const res = await getStudentResults({ examId: selectedExamId, classId: selectedClassId });
    setResults(res);
  };

  const handleTogglePublish = async (examId: string, currentStatus: boolean) => {
    if (!currentUser) return;
    try {
      await toggleExamPublish(examId, !currentStatus, currentUser);
      showSuccess(
        'Publish State Updated',
        `Exam results are now ${!currentStatus ? 'Published to Student Portal' : 'Unpublished (Draft)'}.`
      );
      loadInitialData();
    } catch (err: any) {
      showError('Action Failed', err.message);
    }
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await createExam(
        {
          title: newExamTitle,
          academicSession: '2026-2027',
          startDate: newExamStart,
          endDate: newExamEnd,
          isPublished: false,
          classIds: ['cls-06', 'cls-07', 'cls-08', 'cls-09', 'cls-10'],
        },
        currentUser
      );
      showSuccess('Exam Term Added', `Created ${newExamTitle}.`);
      setIsCreateExamOpen(false);
      setNewExamTitle('');
      loadInitialData();
    } catch (err: any) {
      showError('Creation Error', err.message);
    }
  };

  const openMarksEntry = (student: Student) => {
    setSelectedStudentForMarks(student);
    const existing = results.find((r) => r.studentId === student.id);
    const initialMarks: Record<string, number> = {};
    const classSubs = subjects.filter((s) => s.classId === student.classId);

    classSubs.forEach((sub) => {
      const markObj = existing?.marks.find((m) => m.subjectId === sub.id);
      initialMarks[sub.id] = markObj ? markObj.obtainedMarks : 80;
    });

    setMarksInput(initialMarks);
    setTeacherRemarks(existing?.teacherRemarks || 'Consistent academic rigor.');
  };

  const handleSaveMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForMarks || !currentUser) return;

    try {
      const classSubs = subjects.filter((s) => s.classId === selectedStudentForMarks.classId);
      const marksList = classSubs.map((sub) => {
        const obt = Number(marksInput[sub.id] || 0);
        let grade = 'B';
        if (obt >= 90) grade = 'A+';
        else if (obt >= 80) grade = 'A';
        else if (obt >= 70) grade = 'B';
        else if (obt >= 60) grade = 'C';
        else if (obt >= 50) grade = 'D';
        else grade = 'F';

        return {
          subjectId: sub.id,
          totalMarks: 100,
          obtainedMarks: obt,
          passingMarks: 50,
          grade,
        };
      });

      await saveStudentResult(
        {
          examId: selectedExamId,
          studentId: selectedStudentForMarks.id,
          classId: selectedStudentForMarks.classId,
          sectionId: selectedStudentForMarks.sectionId,
          marks: marksList,
          teacherRemarks,
        },
        currentUser
      );

      showSuccess('Marks Saved', `Recorded subject scores for ${selectedStudentForMarks.fullName}.`);
      setSelectedStudentForMarks(null);
      loadResults();
    } catch (err: any) {
      showError('Save Error', err.message);
    }
  };

  const activeExam = exams.find((e) => e.id === selectedExamId);
  const classStudents = students.filter((s) => s.classId === selectedClassId);
  const classSubjects = subjects.filter((s) => s.classId === selectedClassId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            Examinations, Marks & Tabulations
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Standardized grading scales, auto-calculated GPAs, class rank matrices, and printable report cards.
          </p>
        </div>

        <button
          onClick={() => setIsCreateExamOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Examination Term</span>
        </button>
      </div>

      {/* Selector Strip */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Exam Selector */}
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] text-neutral-900 dark:text-white font-semibold focus:outline-none"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} {ex.isPublished ? '(Published)' : '(Draft)'}
              </option>
            ))}
          </select>

          {/* Class Selector */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] text-neutral-900 dark:text-white font-semibold focus:outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Publish Toggle Button */}
        {activeExam && (
          <div className="flex items-center gap-2.5">
            <span className="text-xs text-neutral-400">Portal Visibility:</span>
            <button
              onClick={() => handleTogglePublish(activeExam.id, activeExam.isPublished)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 ${
                activeExam.isPublished
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{activeExam.isPublished ? 'Published to Students' : 'Draft (Admin Only)'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabulation Grid */}
      <div className="rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 dark:border-[#242E56] flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-neutral-400 font-['Sora']">
            Master Tabulation Sheet · {classStudents.length} Students
          </span>
          <span className="text-xs text-neutral-500">Grading System: Standard Board Scale (A+ to F)</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-[#0E152B] border-b border-neutral-200 dark:border-[#242E56] text-neutral-500 font-semibold select-none">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Student & Roll</th>
                <th className="py-3 px-4">Total Score</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">GPA</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
              {classStudents.map((stu) => {
                const res = results.find((r) => r.studentId === stu.id);

                return (
                  <tr key={stu.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1A2347]/50">
                    <td className="py-3 px-4 font-mono font-bold text-amber-500">
                      {res ? `#${res.classRank}` : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900 dark:text-white">{stu.fullName}</div>
                      <div className="text-[10px] text-neutral-400 font-mono">{stu.rollNumber}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold">
                      {res ? `${res.totalObtainedMarks} / ${res.totalMaxMarks}` : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-teal-400">
                      {res ? `${res.percentage}%` : '—'}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold">{res?.grade || '—'}</td>
                    <td className="py-3 px-4 font-mono">{res?.gpa || '—'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          res?.status === 'PASSED'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {res ? res.status : 'Awaiting Entry'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openMarksEntry(stu)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                        >
                          {res ? 'Edit Marks' : 'Enter Marks'}
                        </button>
                        {res && (
                          <button
                            onClick={() => setPrintableCard({ result: res, student: stu })}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1A2347]"
                            title="Print Official Report Card"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MARKS ENTRY MODAL */}
      {selectedStudentForMarks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base font-['Sora']">
              Enter Marks: {selectedStudentForMarks.fullName}
            </h3>
            <p className="text-xs text-neutral-500">
              Roll No: {selectedStudentForMarks.rollNumber} · Class {selectedStudentForMarks.classId}
            </p>

            <form onSubmit={handleSaveMarks} className="space-y-4">
              <div className="space-y-3">
                {classSubjects.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between text-xs gap-3">
                    <span className="font-medium text-neutral-700 dark:text-neutral-300 flex-1 truncate">
                      {sub.name} ({sub.code})
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        required
                        value={marksInput[sub.id] ?? 80}
                        onChange={(e) =>
                          setMarksInput({ ...marksInput, [sub.id]: Number(e.target.value) })
                        }
                        className="w-20 px-2 py-1 text-center font-mono font-bold text-xs rounded-lg border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                      />
                      <span className="text-neutral-400 font-mono">/ 100</span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Faculty Remarks on Report Card</label>
                <input
                  type="text"
                  value={teacherRemarks}
                  onChange={(e) => setTeacherRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedStudentForMarks(null)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save & Compute Ranks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE EXAM MODAL */}
      {isCreateExamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">New Examination Assessment</h3>
            <form onSubmit={handleCreateExam} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Exam Term Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Annual Final Examinations 2027"
                  value={newExamTitle}
                  onChange={(e) => setNewExamTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">Commencement Date</label>
                  <input
                    type="date"
                    required
                    value={newExamStart}
                    onChange={(e) => setNewExamStart(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Conclusion Date</label>
                  <input
                    type="date"
                    required
                    value={newExamEnd}
                    onChange={(e) => setNewExamEnd(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateExamOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save Exam Term
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE REPORT CARD MODAL */}
      {printableCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white border border-neutral-200 rounded-2xl shadow-2xl p-8 text-neutral-900 space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between no-print border-b pb-3">
              <span className="font-bold text-sm font-['Sora']">Official Academic Transcript & Report Card</span>
              <button onClick={() => setPrintableCard(null)} className="text-neutral-500 hover:text-black">
                ✕
              </button>
            </div>

            {/* Official Report Card Sheet */}
            <div className="p-8 border-2 border-indigo-900/30 rounded-xl space-y-6 print-break-inside-avoid text-xs">
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-neutral-800 pb-4">
                <Logo size="sidebar" variant="full" isDark={false} />
                <div className="text-right">
                  <div className="font-bold text-base font-['Sora'] text-indigo-950">ACADEMIC REPORT CARD</div>
                  <div className="text-[11px] text-neutral-600">{activeExam?.title} · Session 2026-2027</div>
                </div>
              </div>

              {/* Student Bio */}
              <div className="grid grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <div>
                  <span className="text-neutral-500 block text-[10px]">Student Name</span>
                  <span className="font-bold text-sm">{printableCard.student.fullName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Roll Number</span>
                  <span className="font-mono font-bold text-sm">{printableCard.student.rollNumber}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Admission Number</span>
                  <span className="font-mono">{printableCard.student.admissionNumber}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Academic Class</span>
                  <span className="font-semibold">{printableCard.result.classId}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Class Cohort Rank</span>
                  <span className="font-mono font-bold text-indigo-700">Rank #{printableCard.result.classRank}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Cumulative GPA</span>
                  <span className="font-mono font-bold text-emerald-700">{printableCard.result.gpa} / 4.0</span>
                </div>
              </div>

              {/* Subject Marks Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-neutral-300 text-neutral-600 text-[11px]">
                    <th className="py-2.5">Subject</th>
                    <th className="py-2.5 text-center">Max Marks</th>
                    <th className="py-2.5 text-center">Passing</th>
                    <th className="py-2.5 text-center">Obtained Marks</th>
                    <th className="py-2.5 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-neutral-800">
                  {printableCard.result.marks.map((m, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-medium">{m.subjectId}</td>
                      <td className="py-2 text-center font-mono">{m.totalMarks}</td>
                      <td className="py-2 text-center font-mono">50</td>
                      <td className="py-2 text-center font-mono font-bold text-indigo-900">{m.obtainedMarks}</td>
                      <td className="py-2 text-center font-mono font-bold">{m.grade}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 font-bold text-sm bg-neutral-50">
                    <td className="py-2.5 px-2">Total Aggregation</td>
                    <td className="py-2.5 text-center font-mono">{printableCard.result.totalMaxMarks}</td>
                    <td className="py-2.5 text-center font-mono">—</td>
                    <td className="py-2.5 text-center font-mono text-indigo-900">{printableCard.result.totalObtainedMarks}</td>
                    <td className="py-2.5 text-center font-mono text-emerald-700">{printableCard.result.grade} ({printableCard.result.percentage}%)</td>
                  </tr>
                </tbody>
              </table>

              {/* Remarks */}
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[10px] text-neutral-500 font-semibold block uppercase">Faculty Appraisal</span>
                <p className="italic text-neutral-800 mt-1">{printableCard.result.teacherRemarks}</p>
              </div>

              {/* Signatures */}
              <div className="pt-8 flex justify-between items-end text-[11px] text-neutral-600">
                <div className="text-center">
                  <div className="border-t border-neutral-400 w-36 pt-1 font-mono">Class Teacher</div>
                </div>
                <div className="text-center">
                  <div className="border-t border-neutral-400 w-36 pt-1 font-mono">Principal & Seal</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 no-print">
              <button
                onClick={() => setPrintableCard(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-500 hover:text-black"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white flex items-center gap-1.5 shadow-sm hover:bg-indigo-500"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Report Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
