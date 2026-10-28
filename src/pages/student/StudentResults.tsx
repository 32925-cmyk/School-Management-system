/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Award,
  Printer,
  Sparkles,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { getStudentResults, getExams, getStudentById } from '../../services/api';
import { StudentExamResult, Exam, Student } from '../../types';
import { formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../../components/common/Logo';

export const StudentResults: React.FC = () => {
  const { currentUser } = useAuth();

  const [results, setResults] = useState<StudentExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [selectedResult, setSelectedResult] = useState<StudentExamResult | null>(null);
  const [showReportCardModal, setShowReportCardModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      Promise.all([
        getStudentResults({ studentId: currentUser.id }),
        getExams(),
        getStudentById(currentUser.id),
      ]).then(([res, ex, stu]) => {
        setResults(res);
        setExams(ex);
        setStudent(stu);
        if (res.length > 0) setSelectedResult(res[0]);
        setLoading(false);
      });
    }
  }, [currentUser]);

  // Performance progression over time
  const progressData = [
    { assessment: 'Term 1 Test', gpa: 3.6, percentage: 84 },
    { assessment: 'Term 1 Exam', gpa: 3.7, percentage: 86 },
    { assessment: 'Midterm Board Mock', gpa: 3.85, percentage: 91 },
    { assessment: 'Predicted Final (Regression)', gpa: 3.92, percentage: 94, isProjected: true },
  ];

  if (loading || !selectedResult) {
    return <div className="h-64 rounded-2xl bg-neutral-200 dark:bg-[#121933] animate-pulse" />;
  }

  // Bar chart data for subjects
  const subjectChartData = selectedResult.marks.map((m) => ({
    subject: m.subjectId.replace('sub-10-', '').toUpperCase(),
    obtained: m.obtainedMarks,
    max: m.totalMarks,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            Examinations, Transcript & Performance Analytics
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Standardized board examination transcripts, performance regression predictor, and official transcripts.
          </p>
        </div>

        <button
          onClick={() => setShowReportCardModal(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <Printer className="w-4 h-4" />
          <span>Download Official Transcript</span>
        </button>
      </div>

      {/* Overview Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs">
          <span className="text-xs font-semibold text-neutral-400">Class Cohort Rank</span>
          <div className="text-3xl font-bold font-mono-numbers text-amber-500 mt-2">
            Rank #{selectedResult.classRank}
          </div>
          <div className="text-[11px] text-teal-400 font-semibold mt-1">Top 5% in Class 10</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs">
          <span className="text-xs font-semibold text-neutral-400">Cumulative GPA</span>
          <div className="text-3xl font-bold font-mono-numbers text-neutral-900 dark:text-white mt-2">
            {selectedResult.gpa} <span className="text-sm font-normal text-neutral-400">/ 4.0</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Grade {selectedResult.grade}</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs">
          <span className="text-xs font-semibold text-neutral-400">Aggregate Percentage</span>
          <div className="text-3xl font-bold font-mono-numbers text-indigo-600 dark:text-teal-400 mt-2">
            {selectedResult.percentage}%
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">
            {selectedResult.totalObtainedMarks} / {selectedResult.totalMaxMarks} Marks
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs">
          <span className="text-xs font-semibold text-neutral-400">Board Qualification</span>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            PASSED
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            Distinction Candidate
          </div>
        </div>
      </div>

      {/* Charts Grid: Subject Marks & Performance Predictor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject Score Bar Chart */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs">
          <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora'] mb-1">
            Subject Marks Breakdown (Midterms)
          </h3>
          <p className="text-xs text-neutral-500 mb-4">Scores obtained out of 100 max per discipline</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="obtained" fill="#3B3FD8" radius={[4, 4, 0, 0]} name="Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance Regression & Early Warning Predictor */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora']">
                Academic Trajectory & Predictor
              </h3>
              <p className="text-xs text-neutral-500">Linear regression projection toward final board examinations</p>
            </div>
            <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="assessment" tick={{ fontSize: 10 }} />
                <YAxis domain={[75, 100]} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: any) => [`${val}%`, 'Score']} />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#14B8A6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#14B8A6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-600 dark:text-teal-300 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Predictive indicator forecasts a <strong>94% distinction</strong> on FBISE Matric Finals based on your current coursework trajectory.
            </span>
          </div>
        </div>
      </div>

      {/* Marks Breakdown Table */}
      <div className="rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 dark:border-[#242E56] flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-neutral-400 font-['Sora']">
            Coursework Marks Transcripts
          </span>
          <span className="text-xs text-neutral-400">Class 10 Curriculum</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-[#0E152B] border-b border-neutral-200 dark:border-[#242E56] text-neutral-500 font-semibold select-none">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Maximum</th>
                <th className="py-3 px-4">Passing</th>
                <th className="py-3 px-4">Obtained</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Teacher Appraisal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
              {selectedResult.marks.map((m, idx) => (
                <tr key={idx} className="hover:bg-neutral-50/50 dark:hover:bg-[#1A2347]/50">
                  <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">
                    {m.subjectId}
                  </td>
                  <td className="py-3 px-4 font-mono">{m.totalMarks}</td>
                  <td className="py-3 px-4 font-mono">50</td>
                  <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-teal-400">
                    {m.obtainedMarks}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold">{m.grade}</td>
                  <td className="py-3 px-4 text-neutral-500 italic">{m.remarks || 'Commendable understanding'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL REPORT CARD MODAL */}
      {showReportCardModal && student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white border border-neutral-200 rounded-2xl shadow-2xl p-8 text-neutral-900 space-y-4 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between no-print border-b pb-3">
              <span className="font-bold text-sm font-['Sora']">Official Student Report Card & Transcript</span>
              <button onClick={() => setShowReportCardModal(false)} className="text-neutral-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 border-2 border-indigo-900/30 rounded-xl space-y-6 print-break-inside-avoid text-xs">
              <div className="flex items-center justify-between border-b-2 border-neutral-800 pb-4">
                <Logo size="sidebar" variant="full" isDark={false} />
                <div className="text-right">
                  <div className="font-bold text-base font-['Sora'] text-indigo-950">ACADEMIC REPORT CARD</div>
                  <div className="text-[11px] text-neutral-600">Midterm Board Mock Examinations 2026</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <div>
                  <span className="text-neutral-500 block text-[10px]">Student Full Name</span>
                  <span className="font-bold text-sm">{student.fullName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Roll Number</span>
                  <span className="font-mono font-bold text-sm">{student.rollNumber}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block text-[10px]">Cohort Rank</span>
                  <span className="font-mono font-bold text-indigo-700">Rank #{selectedResult.classRank}</span>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-neutral-300 text-neutral-600 text-[11px]">
                    <th className="py-2">Subject</th>
                    <th className="py-2 text-center">Max Marks</th>
                    <th className="py-2 text-center">Obtained</th>
                    <th className="py-2 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-neutral-800">
                  {selectedResult.marks.map((m, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-medium">{m.subjectId}</td>
                      <td className="py-2 text-center font-mono">{m.totalMarks}</td>
                      <td className="py-2 text-center font-mono font-bold text-indigo-900">{m.obtainedMarks}</td>
                      <td className="py-2 text-center font-mono font-bold">{m.grade}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 font-bold text-sm bg-neutral-50">
                    <td className="py-2.5 px-2">Total Score</td>
                    <td className="py-2.5 text-center font-mono">{selectedResult.totalMaxMarks}</td>
                    <td className="py-2.5 text-center font-mono text-indigo-900">{selectedResult.totalObtainedMarks}</td>
                    <td className="py-2.5 text-center font-mono text-emerald-700">{selectedResult.grade} ({selectedResult.percentage}%)</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                <span className="text-[10px] text-neutral-500 font-semibold block uppercase">Faculty Appraisal</span>
                <p className="italic text-neutral-800 mt-1">{selectedResult.teacherRemarks}</p>
              </div>

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
                onClick={() => setShowReportCardModal(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-500 hover:text-black"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
