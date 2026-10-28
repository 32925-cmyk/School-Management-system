/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  CalendarCheck,
  CreditCard,
  Award,
  FolderOpen,
  Activity,
  KeyRound,
  ShieldAlert,
  Printer,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  getStudentById,
  getStudentAttendanceHistory,
  getFeeVouchers,
  getStudentResults,
  resetStudentPasswordByAdmin,
  updateStudent,
  uploadStudentDocument,
  getAuditLogs,
} from '../../services/api';
import { Student, AttendanceRecord, FeeVoucher, StudentExamResult, AuditLogEntry } from '../../types';
import { formatPKR, formatDate } from '../../utils/formatters';
import { generateStrongPassword } from '../../utils/security';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Logo } from '../../components/common/Logo';

export const StudentProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [student, setStudent] = useState<Student | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [vouchers, setVouchers] = useState<FeeVoucher[]>([]);
  const [results, setResults] = useState<StudentExamResult[]>([]);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'fees' | 'results' | 'documents' | 'activity'>('overview');
  const [loading, setLoading] = useState(true);

  // Password reset modal state
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [newTempPass, setNewTempPass] = useState('Student@2026!');
  const [showIdCardModal, setShowIdCardModal] = useState(false);

  // New Document upload state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);

  useEffect(() => {
    if (id) {
      loadStudentData(id);
    }
  }, [id]);

  const loadStudentData = async (studentId: string) => {
    try {
      setLoading(true);
      const [stu, att, vch, res, audit] = await Promise.all([
        getStudentById(studentId),
        getStudentAttendanceHistory(studentId),
        getFeeVouchers({ studentId }),
        getStudentResults({ studentId }),
        getAuditLogs(),
      ]);

      if (!stu) {
        showError('Student Not Found', 'No student record found with this ID.');
        navigate('/admin/students');
        return;
      }

      setStudent(stu);
      setAttendance(att);
      setVouchers(vch);
      setResults(res);
      setLogs(audit.filter((l) => l.details.includes(stu.fullName) || l.details.includes(studentId)));
    } catch (err: any) {
      showError('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!student || !currentUser) return;
    try {
      await resetStudentPasswordByAdmin(currentUser, student.id, newTempPass);
      showSuccess('Password Reset', `Temporary password for ${student.fullName} updated to "${newTempPass}". Student will be forced to change it on next login.`);
      setIsResetPassModalOpen(false);
      loadStudentData(student.id);
    } catch (err: any) {
      showError('Reset Failed', err.message);
    }
  };

  const handleDocumentUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || !docTitle) return;

    try {
      await uploadStudentDocument(student.id, {
        title: docTitle,
        fileName: docFile?.name || 'document_scan.pdf',
        fileSize: docFile ? `${(docFile.size / 1024).toFixed(0)} KB` : '1.2 MB',
        fileType: 'application/pdf',
      });
      showSuccess('Document Uploaded', 'Attached document to student record vault.');
      setIsDocModalOpen(false);
      setDocTitle('');
      setDocFile(null);
      loadStudentData(student.id);
    } catch (err: any) {
      showError('Upload Error', err.message);
    }
  };

  if (loading || !student) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-40 bg-neutral-200 dark:bg-[#121933] rounded-2xl" />
        <div className="h-96 bg-neutral-200 dark:bg-[#121933] rounded-2xl" />
      </div>
    );
  }

  // Attendance metrics
  const totalDays = attendance.length;
  const presentDays = attendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 95;

  // Dues
  const unpaidVouchers = vouchers.filter((v) => v.status === 'UNPAID' || v.status === 'PARTIAL' || v.status === 'OVERDUE');
  const outstandingDues = unpaidVouchers.reduce((s, v) => s + v.remainingAmount, 0);

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/admin/students')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Directory</span>
        </button>
      </div>

      {/* Header Profile Hero Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-bold text-2xl shadow-md border border-white/20 shrink-0">
            {student.fullName[0]}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold font-['Sora'] text-neutral-900 dark:text-white">
                {student.fullName}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {student.status}
              </span>
            </div>
            <div className="text-xs text-neutral-500 flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>Roll: <strong className="font-mono text-neutral-900 dark:text-white">{student.rollNumber}</strong></span>
              <span>Admission: <strong className="font-mono text-neutral-900 dark:text-white">{student.admissionNumber}</strong></span>
              <span>Email: <span className="font-mono">{student.email}</span></span>
              <span>Mobile: <span className="font-mono">{student.phone}</span></span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowIdCardModal(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-[#242E56] hover:bg-neutral-50 dark:hover:bg-[#1A2347] flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4 text-indigo-500" />
            <span>Official ID Card</span>
          </button>
          <button
            onClick={() => setIsResetPassModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <KeyRound className="w-4 h-4" />
            <span>Reset Student Password</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-[#242E56] gap-2 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: User },
          { key: 'attendance', label: `Attendance (${attendanceRate}%)`, icon: CalendarCheck },
          { key: 'fees', label: `Fees & Dues (${formatPKR(outstandingDues)})`, icon: CreditCard },
          { key: 'results', label: `Academic Results (${results.length})`, icon: Award },
          { key: 'documents', label: `Document Vault (${student.documents?.length || 0})`, icon: FolderOpen },
          { key: 'activity', label: 'Audit Trail', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-teal-400 dark:border-teal-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-4">
              <h3 className="font-bold text-sm font-['Sora'] text-neutral-900 dark:text-white">
                Personal & Family Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 block mb-0.5">Date of Birth</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{formatDate(student.dateOfBirth)}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Gender</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{student.gender}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Blood Group</span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{student.bloodGroup || 'B+'}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Enrollment Date</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{formatDate(student.enrollmentDate)}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Father / Guardian Name</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{student.guardianName}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-0.5">Guardian Contact</span>
                  <span className="font-mono text-neutral-900 dark:text-white">{student.guardianPhone}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-neutral-400 block mb-0.5">Residential Address</span>
                  <span className="font-medium text-neutral-900 dark:text-white">{student.address}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-3">
              <h3 className="font-bold text-sm font-['Sora'] text-neutral-900 dark:text-white">
                Transport & Route Assignment
              </h3>
              {student.transportRouteId ? (
                <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#1A2347] border border-neutral-200 dark:border-[#242E56] text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white">Bus Route 1 (F-Sector Express)</div>
                    <div className="text-[11px] text-neutral-400">Designated Stop: F-10 Markaz (07:15 AM)</div>
                  </div>
                  <span className="font-mono font-semibold text-teal-500">ISB-8219 (Coaster)</span>
                </div>
              ) : (
                <p className="text-xs text-neutral-500">Student is self-commuter (No bus route assigned).</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-4">
              <h3 className="font-bold text-sm font-['Sora'] text-neutral-900 dark:text-white">
                Academic Snapshot
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1A2347] flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Attendance Rate</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">{attendanceRate}%</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1A2347] flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Outstanding Dues</span>
                  <span className="font-mono font-bold text-neutral-900 dark:text-white">{formatPKR(outstandingDues)}</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1A2347] flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Class Rank (Midterms)</span>
                  <span className="font-mono font-bold text-amber-500">Rank #{results[0]?.classRank || 1}</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1A2347] flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Cumulative GPA</span>
                  <span className="font-mono font-bold text-teal-500">{results[0]?.gpa || 3.8} / 4.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm font-['Sora'] text-neutral-900 dark:text-white">
              Daily Attendance Register History
            </h3>
            <span className="text-xs font-mono text-neutral-400">{attendance.length} Sessions Logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-[#0E152B] border-b border-neutral-200 dark:border-[#242E56] text-neutral-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Remarks / Sanction</th>
                  <th className="py-2.5 px-4">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
                {attendance.map((rec) => (
                  <tr key={rec.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1A2347]/50">
                    <td className="py-2.5 px-4 font-mono">{formatDate(rec.date)}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          rec.status === 'PRESENT'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : rec.status === 'LATE'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : rec.status === 'LEAVE'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-neutral-500">{rec.remarks || 'Regular presence'}</td>
                    <td className="py-2.5 px-4 text-neutral-400 font-mono text-[11px]">{rec.markedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. FEES TAB */}
      {activeTab === 'fees' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm font-['Sora'] text-neutral-900 dark:text-white">
              Fee Vouchers & Payment Reconciliations
            </h3>
            <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
              Remaining: {formatPKR(outstandingDues)}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-[#0E152B] border-b border-neutral-200 dark:border-[#242E56] text-neutral-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Voucher No</th>
                  <th className="py-2.5 px-4">Billing Month</th>
                  <th className="py-2.5 px-4">Total Amount</th>
                  <th className="py-2.5 px-4">Paid Amount</th>
                  <th className="py-2.5 px-4">Due Date</th>
                  <th className="py-2.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
                {vouchers.map((vch) => (
                  <tr key={vch.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1A2347]/50">
                    <td className="py-2.5 px-4 font-mono font-semibold text-indigo-600 dark:text-teal-400">
                      {vch.voucherNumber}
                    </td>
                    <td className="py-2.5 px-4">{vch.month}</td>
                    <td className="py-2.5 px-4 font-mono font-semibold">{formatPKR(vch.totalAmount)}</td>
                    <td className="py-2.5 px-4 font-mono">{formatPKR(vch.paidAmount)}</td>
                    <td className="py-2.5 px-4 font-mono">{formatDate(vch.dueDate)}</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          vch.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : vch.status === 'OVERDUE'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {vch.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. RESULTS TAB */}
      {activeTab === 'results' && (
        <div className="space-y-6">
          {results.map((res) => (
            <div key={res.id} className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-[#242E56] pb-3">
                <div>
                  <h4 className="font-bold text-sm font-['Sora'] text-neutral-900 dark:text-white">
                    Midterm Examination Assessment
                  </h4>
                  <div className="text-[11px] text-neutral-400">Published: {formatDate(res.publishedAt || '')}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-amber-500">Rank #{res.classRank}</div>
                    <div className="text-[11px] font-mono text-teal-400">{res.percentage}% · Grade {res.grade}</div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50 dark:bg-[#0E152B] border-b border-neutral-200 dark:border-[#242E56] text-neutral-500 font-semibold">
                    <tr>
                      <th className="py-2 px-4">Subject</th>
                      <th className="py-2 px-4">Max Marks</th>
                      <th className="py-2 px-4">Obtained</th>
                      <th className="py-2 px-4">Grade</th>
                      <th className="py-2 px-4">Faculty Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
                    {res.marks.map((m, mIdx) => (
                      <tr key={mIdx}>
                        <td className="py-2.5 px-4 font-medium">{m.subjectId}</td>
                        <td className="py-2.5 px-4 font-mono">{m.totalMarks}</td>
                        <td className="py-2.5 px-4 font-mono font-bold text-indigo-600 dark:text-teal-400">{m.obtainedMarks}</td>
                        <td className="py-2.5 px-4 font-mono">{m.grade}</td>
                        <td className="py-2.5 px-4 text-neutral-400">{m.remarks || 'Mastery demonstrated'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. DOCUMENTS TAB */}
      {activeTab === 'documents' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm font-['Sora'] text-neutral-900 dark:text-white">
                Official Document Vault
              </h3>
              <p className="text-xs text-neutral-500">NADRA certificates, school leaving diplomas, and medical records.</p>
            </div>
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(student.documents || []).map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#1A2347] flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-neutral-900 dark:text-white">{doc.title}</div>
                    <div className="text-[11px] font-mono text-neutral-400">{doc.fileName} · {doc.fileSize}</div>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-neutral-400">{doc.uploadDate}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. ACTIVITY TAB */}
      {activeTab === 'activity' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] space-y-4">
          <h3 className="font-bold text-sm font-['Sora'] text-neutral-900 dark:text-white">
            Audit Trail for {student.fullName}
          </h3>
          <div className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
            {logs.length === 0 ? (
              <p className="text-xs text-neutral-500 py-4">No audit logs specifically targeted to this student ID.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <div className="font-semibold text-neutral-900 dark:text-white font-mono">{log.action}</div>
                    <p className="text-neutral-500 text-[11px] mt-0.5">{log.details}</p>
                  </div>
                  <span className="font-mono text-[10px] text-neutral-400">{formatDate(log.timestamp)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {isResetPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">
              Issue Temporary Password
            </h3>
            <p className="text-xs text-neutral-500">
              This will overwrite {student.fullName}'s password and flag their account to mandate a password change on next login.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold">New Temporary Password</label>
                <button
                  type="button"
                  onClick={() => setNewTempPass(generateStrongPassword())}
                  className="text-[11px] text-indigo-500 hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate</span>
                </button>
              </div>
              <input
                type="text"
                value={newTempPass}
                onChange={(e) => setNewTempPass(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsResetPassModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-500 text-white"
              >
                Confirm & Force Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT UPLOAD MODAL */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">Upload Official Document</h3>
            <form onSubmit={handleDocumentUpload} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NADRA B-Form Attestation"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Select File (PDF / Image)</label>
                <input
                  type="file"
                  onChange={(e) => setDocFile(e.target.files?.[0] || null)}
                  className="text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Upload & Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE QR ID BADGE MODAL */}
      {showIdCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between no-print">
              <span className="font-bold text-sm font-['Sora']">Printable Student ID Card</span>
              <button onClick={() => setShowIdCardModal(false)} className="text-neutral-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-[#121933] via-[#0E152B] to-[#0B1020] border-2 border-[#E8B04B]/40 text-white shadow-2xl relative overflow-hidden print-break-inside-avoid">
              <div className="flex items-center justify-between border-b border-[#242E56] pb-3">
                <Logo size="sidebar" variant="full" isDark={true} />
                <span className="text-[10px] uppercase font-mono tracking-wider text-amber-300 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  Student Identity
                </span>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <div className="w-20 h-24 rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex flex-col items-center justify-center font-bold text-2xl shadow-md border border-white/20 shrink-0">
                  <span>{student.fullName[0]}</span>
                  <span className="text-[9px] uppercase tracking-wider font-mono opacity-80 mt-1">Photo</span>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-bold text-base font-['Sora'] text-white">{student.fullName}</div>
                  <div className="text-xs text-neutral-300">
                    Roll No: <span className="font-mono text-amber-300 font-bold">{student.rollNumber}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400">
                    Admission: <span className="font-mono">{student.admissionNumber}</span>
                  </div>
                  <div className="text-[11px] text-teal-300">
                    Blood Group: <span className="font-mono font-bold">{student.bloodGroup || 'O+'}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-[#242E56] flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-neutral-400">Authorized Signature</div>
                  <div className="text-xs font-serif italic text-teal-300 mt-0.5">Prof. T. Mansoor</div>
                </div>
                <div className="p-1.5 rounded-lg bg-white shrink-0">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="black">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm8-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm2-2h2v2h-2v-2zm-6 4h4v2h-4v-2zm6 0h2v2h-2v-2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2 no-print">
              <button onClick={() => setShowIdCardModal(false)} className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-400 hover:text-white">
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm"
              >
                Print Badge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
