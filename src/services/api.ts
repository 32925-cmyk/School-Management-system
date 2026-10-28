/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Student,
  Teacher,
  SchoolClass,
  SchoolSection,
  Subject,
  AttendanceRecord,
  FeeVoucher,
  PaymentTransaction,
  Exam,
  StudentExamResult,
  Assignment,
  AssignmentSubmission,
  SchoolNotice,
  SchoolEvent,
  LibraryBook,
  BookLoan,
  TransportRoute,
  LeaveRequest,
  SupportTicket,
  AuditLogEntry,
  SystemSettings,
  NotificationItem,
  FeeHeadType,
} from '../types';
import {
  getDatabase,
  saveDatabase,
  addAuditLog,
  resetDemoData,
  initializeDatabase,
} from './localDb';
import { hashPassword } from '../utils/security';

// Ensure DB is initialized
let initPromise: Promise<any> | null = null;
async function ensureDb() {
  if (!initPromise) {
    initPromise = initializeDatabase();
  }
  return initPromise;
}

// ─────────────────────────────────────────────────────────────
// AUTHENTICATION
// ─────────────────────────────────────────────────────────────

export async function loginUser(
  identifier: string, // Email or Pakistani phone
  passwordPlain: string,
  role: 'ADMIN' | 'STUDENT'
): Promise<{ user: User; token: string }> {
  await ensureDb();
  const db = getDatabase();

  const cleanIdentifier = identifier.trim().toLowerCase();
  const cleanPhoneInput = identifier.replace(/[\s\-\(\)]/g, '');

  const user = db.users.find((u) => {
    if (u.role !== role) return false;
    const emailMatch = u.email.toLowerCase() === cleanIdentifier;
    const phoneMatch = u.phone ? u.phone.replace(/[\s\-\(\)]/g, '').endsWith(cleanPhoneInput.slice(-10)) : false;
    return emailMatch || phoneMatch;
  });

  if (!user) {
    throw new Error(`No ${role.toLowerCase()} account found matching "${identifier}".`);
  }

  // Check lockout
  if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
    const remainingMins = Math.ceil(
      (new Date(user.lockedUntil).getTime() - Date.now()) / (60 * 1000)
    );
    throw new Error(`Account locked due to 5 failed attempts. Please retry in ${remainingMins} minutes.`);
  }

  const inputHash = await hashPassword(passwordPlain);
  const storedHash = db.passwordHashes[user.id];

  if (storedHash !== inputHash) {
    const attempts = (user.failedLoginAttempts || 0) + 1;
    user.failedLoginAttempts = attempts;

    if (attempts >= 5) {
      user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins
      saveDatabase(db);
      throw new Error('Account locked for 15 minutes due to 5 consecutive failed attempts.');
    }

    saveDatabase(db);
    throw new Error(`Invalid credentials. ${5 - attempts} attempts remaining.`);
  }

  // Successful login reset
  user.failedLoginAttempts = 0;
  user.lockedUntil = null;
  user.lastLogin = new Date().toISOString();
  saveDatabase(db);

  addAuditLog('USER_LOGIN', 'Auth', `Successful login for ${user.fullName} (${user.role})`, {
    id: user.id,
    name: user.fullName,
    role: user.role,
  });

  return {
    user,
    token: `ah_token_${user.id}_${Date.now()}`,
  };
}

export async function changeUserPassword(
  userId: string,
  oldPlain: string,
  newPlain: string
): Promise<void> {
  await ensureDb();
  const db = getDatabase();
  const user = db.users.find((u) => u.id === userId);
  if (!user) throw new Error('User not found.');

  const oldHash = await hashPassword(oldPlain);
  if (db.passwordHashes[userId] !== oldHash) {
    throw new Error('Current password is incorrect.');
  }

  const newHash = await hashPassword(newPlain);
  db.passwordHashes[userId] = newHash;
  user.mustChangePassword = false;
  saveDatabase(db);

  addAuditLog('PASSWORD_CHANGE', 'Auth', `Password updated for ${user.fullName}`, {
    id: user.id,
    name: user.fullName,
    role: user.role,
  });
}

export async function resetStudentPasswordByAdmin(
  adminUser: User,
  studentId: string,
  newTempPassword: string
): Promise<void> {
  await ensureDb();
  const db = getDatabase();
  const student = db.students.find((s) => s.id === studentId);
  if (!student) throw new Error('Student not found.');

  const newHash = await hashPassword(newTempPassword);
  db.passwordHashes[studentId] = newHash;
  student.mustChangePassword = true;
  saveDatabase(db);

  addAuditLog('ADMIN_RESET_PASSWORD', 'Auth', `Admin reset password for student ${student.fullName}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });
}

// ─────────────────────────────────────────────────────────────
// STUDENTS
// ─────────────────────────────────────────────────────────────

export async function getStudents(filters?: {
  classId?: string;
  sectionId?: string;
  status?: string;
  search?: string;
}): Promise<Student[]> {
  await ensureDb();
  const db = getDatabase();
  let list = db.students;

  if (filters?.classId) {
    list = list.filter((s) => s.classId === filters.classId);
  }
  if (filters?.sectionId) {
    list = list.filter((s) => s.sectionId === filters.sectionId);
  }
  if (filters?.status) {
    list = list.filter((s) => s.status === filters.status);
  }
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q))
    );
  }

  return list;
}

export async function getStudentById(id: string): Promise<Student | null> {
  await ensureDb();
  const db = getDatabase();
  return db.students.find((s) => s.id === id) || null;
}

export async function createStudent(
  data: Omit<Student, 'id' | 'createdAt' | 'failedLoginAttempts' | 'lockedUntil'> & {
    temporaryPassword?: string;
  },
  adminUser: User
): Promise<Student> {
  await ensureDb();
  const db = getDatabase();

  // Validate duplicate email or phone
  const cleanEmail = data.email.trim().toLowerCase();
  if (db.students.some((s) => s.email.toLowerCase() === cleanEmail)) {
    throw new Error(`A student with email "${data.email}" already exists.`);
  }

  const existingPhone = db.students.some(
    (s) => s.phone && s.phone.replace(/[\s\-\(\)]/g, '') === data.phone?.replace(/[\s\-\(\)]/g, '')
  );
  if (existingPhone) {
    throw new Error(`A student with mobile number "${data.phone}" already exists.`);
  }

  const newId = `stu-${Date.now().toString().slice(-5)}`;
  const tempPassword = data.temporaryPassword || 'Student@12345';
  const passHash = await hashPassword(tempPassword);

  const newStudent: Student = {
    ...data,
    id: newId,
    role: 'STUDENT',
    createdAt: new Date().toISOString(),
    mustChangePassword: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
  };

  db.students.push(newStudent);
  db.users.push(newStudent);
  db.passwordHashes[newId] = passHash;

  // Automatically create a monthly voucher for this student
  const currentMonth = '2026-10';
  const tuitionAmount = 18500;
  const labAmount = 2500;
  const transportAmount = newStudent.transportRouteId ? 5500 : 0;

  const items: Array<{ title: string; amount: number; headType: FeeHeadType }> = [
    { title: 'Monthly Tuition Fee', amount: tuitionAmount, headType: 'TUITION' },
    { title: 'Lab Fee', amount: labAmount, headType: 'LAB' },
  ];
  if (transportAmount > 0) {
    items.push({ title: 'School Bus Transport', amount: transportAmount, headType: 'TRANSPORT' });
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  const initialVoucher: FeeVoucher = {
    id: `vch-${Date.now().toString().slice(-6)}`,
    voucherNumber: `VCH-${currentMonth.replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`,
    studentId: newId,
    classId: newStudent.classId,
    sectionId: newStudent.sectionId,
    month: currentMonth,
    issueDate: `${currentMonth}-01`,
    dueDate: `${currentMonth}-15`,
    items,
    subtotal: total,
    discount: 0,
    fine: 0,
    totalAmount: total,
    paidAmount: 0,
    remainingAmount: total,
    status: 'UNPAID',
  };
  db.vouchers.push(initialVoucher);

  saveDatabase(db);

  addAuditLog('CREATE_STUDENT', 'Students', `Enrolled new student: ${newStudent.fullName} (${newStudent.rollNumber})`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });

  return newStudent;
}

export async function updateStudent(
  id: string,
  updates: Partial<Student>,
  adminUser: User
): Promise<Student> {
  await ensureDb();
  const db = getDatabase();
  const index = db.students.findIndex((s) => s.id === id);
  if (index === -1) throw new Error('Student not found.');

  const updated: Student = { ...db.students[index], ...updates };
  db.students[index] = updated;

  // Update in users array too
  const userIdx = db.users.findIndex((u) => u.id === id);
  if (userIdx !== -1) {
    db.users[userIdx] = { ...db.users[userIdx], ...updates };
  }

  saveDatabase(db);

  addAuditLog('UPDATE_STUDENT', 'Students', `Updated profile for: ${updated.fullName}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });

  return updated;
}

export async function archiveStudent(id: string, adminUser: User): Promise<void> {
  await ensureDb();
  const db = getDatabase();
  const student = db.students.find((s) => s.id === id);
  if (!student) throw new Error('Student not found.');

  // Soft delete / archive
  student.status = 'INACTIVE';
  student.isActive = false;

  const user = db.users.find((u) => u.id === id);
  if (user) {
    user.isActive = false;
  }

  saveDatabase(db);

  addAuditLog('ARCHIVE_STUDENT', 'Students', `Archived student account: ${student.fullName}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });
}

export async function promoteStudents(
  studentIds: string[],
  targetClassId: string,
  targetSectionId: string,
  adminUser: User
): Promise<void> {
  await ensureDb();
  const db = getDatabase();

  studentIds.forEach((id) => {
    const student = db.students.find((s) => s.id === id);
    if (student) {
      student.classId = targetClassId;
      student.sectionId = targetSectionId;
    }
  });

  saveDatabase(db);

  addAuditLog('PROMOTE_STUDENTS', 'Academic', `Promoted ${studentIds.length} students to class ${targetClassId}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });
}

export async function uploadStudentDocument(
  studentId: string,
  document: { title: string; fileName: string; fileSize: string; fileType: string; fileData?: string }
): Promise<void> {
  await ensureDb();
  const db = getDatabase();
  const student = db.students.find((s) => s.id === studentId);
  if (!student) throw new Error('Student not found.');

  const newDoc = {
    id: `doc-${Date.now()}`,
    ...document,
    uploadDate: new Date().toISOString().split('T')[0],
  };

  student.documents = [...(student.documents || []), newDoc];
  saveDatabase(db);
}

// ─────────────────────────────────────────────────────────────
// CLASSES, SECTIONS, TEACHERS & SUBJECTS
// ─────────────────────────────────────────────────────────────

export async function getClasses(): Promise<SchoolClass[]> {
  await ensureDb();
  return getDatabase().classes;
}

export async function createClass(name: string, numericGrade: number): Promise<SchoolClass> {
  await ensureDb();
  const db = getDatabase();
  const newClass: SchoolClass = {
    id: `cls-${numericGrade < 10 ? '0' + numericGrade : numericGrade}`,
    name,
    numericGrade,
    sections: [
      {
        id: `sec-${numericGrade}-a`,
        name: 'Section A',
        classId: `cls-${numericGrade < 10 ? '0' + numericGrade : numericGrade}`,
        capacity: 30,
        roomNumber: `Room ${numericGrade}01`,
        classTeacherId: db.teachers[0]?.id || '',
      },
    ],
  };
  db.classes.push(newClass);
  saveDatabase(db);
  return newClass;
}

export async function createSection(
  classId: string,
  sectionName: string,
  capacity: number,
  roomNumber: string,
  classTeacherId: string
): Promise<SchoolSection> {
  await ensureDb();
  const db = getDatabase();
  const cls = db.classes.find((c) => c.id === classId);
  if (!cls) throw new Error('Class not found.');

  const newSection: SchoolSection = {
    id: `sec-${Date.now().toString().slice(-4)}`,
    name: sectionName,
    classId,
    capacity,
    roomNumber,
    classTeacherId,
  };

  cls.sections.push(newSection);
  saveDatabase(db);
  return newSection;
}

export async function getTeachers(): Promise<Teacher[]> {
  await ensureDb();
  return getDatabase().teachers;
}

export async function createTeacher(data: Omit<Teacher, 'id'>, adminUser: User): Promise<Teacher> {
  await ensureDb();
  const db = getDatabase();
  const newTeacher: Teacher = {
    ...data,
    id: `tch-${Date.now().toString().slice(-4)}`,
  };
  db.teachers.push(newTeacher);
  saveDatabase(db);

  addAuditLog('CREATE_TEACHER', 'Staff', `Added staff member: ${newTeacher.fullName}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });

  return newTeacher;
}

export async function getSubjects(classId?: string): Promise<Subject[]> {
  await ensureDb();
  const db = getDatabase();
  if (classId) {
    return db.subjects.filter((s) => s.classId === classId);
  }
  return db.subjects;
}

export async function createSubject(data: Omit<Subject, 'id'>): Promise<Subject> {
  await ensureDb();
  const db = getDatabase();
  const newSubject: Subject = {
    ...data,
    id: `sub-${Date.now().toString().slice(-4)}`,
  };
  db.subjects.push(newSubject);
  saveDatabase(db);
  return newSubject;
}

// ─────────────────────────────────────────────────────────────
// TIMETABLE
// ─────────────────────────────────────────────────────────────

export async function getTimetable(classId: string, sectionId?: string): Promise<any[]> {
  await ensureDb();
  const db = getDatabase();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeslots = [
    { start: '08:00', end: '08:50', period: 1 },
    { start: '08:50', end: '09:40', period: 2 },
    { start: '09:40', end: '10:30', period: 3 },
    { start: '10:30', end: '11:00', period: 'Break' },
    { start: '11:00', end: '11:50', period: 4 },
    { start: '11:50', end: '12:40', period: 5 },
    { start: '12:40', end: '13:30', period: 6 },
    { start: '13:30', end: '14:15', period: 7 },
  ];

  const subjects = db.subjects.filter((s) => s.classId === classId);
  const slots: any[] = [];

  days.forEach((day, dIdx) => {
    timeslots.forEach((ts, tIdx) => {
      if (ts.period === 'Break') return;
      const sub = subjects[(dIdx * 2 + tIdx) % (subjects.length || 1)] || subjects[0];
      const teacher = db.teachers.find((t) => t.id === sub?.teacherId) || db.teachers[0];

      slots.push({
        id: `tt-${classId}-${sectionId || 'all'}-${day}-${ts.period}`,
        dayOfWeek: day,
        period: ts.period,
        startTime: ts.start,
        endTime: ts.end,
        subjectId: sub?.id,
        subjectName: sub?.name || 'Study Hall',
        teacherId: teacher?.id,
        teacherName: teacher?.fullName || 'Senior Faculty',
        roomNumber: 'Hall 301',
      });
    });
  });

  return slots;
}

// ─────────────────────────────────────────────────────────────
// ATTENDANCE
// ─────────────────────────────────────────────────────────────

export async function getAttendanceByClassAndDate(
  classId: string,
  sectionId: string,
  date: string
): Promise<AttendanceRecord[]> {
  await ensureDb();
  const db = getDatabase();
  return db.attendance.filter(
    (a) => a.classId === classId && a.sectionId === sectionId && a.date === date
  );
}

export async function markBatchAttendance(
  classId: string,
  sectionId: string,
  date: string,
  records: Array<{ studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'; remarks?: string }>,
  adminUser: User
): Promise<void> {
  await ensureDb();
  const db = getDatabase();

  // Remove existing records for this class, section, date
  db.attendance = db.attendance.filter(
    (a) => !(a.classId === classId && a.sectionId === sectionId && a.date === date)
  );

  const newRecords: AttendanceRecord[] = records.map((r, i) => ({
    id: `att-${Date.now()}-${i}`,
    studentId: r.studentId,
    classId,
    sectionId,
    date,
    status: r.status,
    remarks: r.remarks,
    markedBy: adminUser.id,
    updatedAt: new Date().toISOString(),
  }));

  db.attendance.push(...newRecords);

  // Auto-notify student if marked absent
  records.forEach((r) => {
    if (r.status === 'ABSENT') {
      db.notifications.push({
        id: `notif-${Date.now()}-${r.studentId}`,
        userId: r.studentId,
        title: 'Absence Notice',
        message: `You were marked absent on ${date}. If this was in error, please contact the administrative office.`,
        type: 'ALERT',
        link: '/student/attendance',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  });

  saveDatabase(db);

  addAuditLog('MARK_ATTENDANCE', 'Attendance', `Marked attendance for Class ${classId} (${sectionId}) on ${date} (${records.length} students)`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });
}

export async function getStudentAttendanceHistory(studentId: string): Promise<AttendanceRecord[]> {
  await ensureDb();
  const db = getDatabase();
  return db.attendance
    .filter((a) => a.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function getDefaulterStudents(thresholdPercent = 75): Promise<any[]> {
  await ensureDb();
  const db = getDatabase();
  const defaulters: any[] = [];

  db.students.forEach((student) => {
    const studentRecords = db.attendance.filter((a) => a.studentId === student.id);
    if (studentRecords.length === 0) return;

    const presentCount = studentRecords.filter(
      (a) => a.status === 'PRESENT' || a.status === 'LATE'
    ).length;
    const rate = Math.round((presentCount / studentRecords.length) * 100);

    if (rate < thresholdPercent) {
      const cls = db.classes.find((c) => c.id === student.classId);
      defaulters.push({
        student,
        className: cls?.name || 'Class',
        totalDays: studentRecords.length,
        presentDays: presentCount,
        attendanceRate: rate,
      });
    }
  });

  return defaulters;
}

// ─────────────────────────────────────────────────────────────
// LEAVE REQUESTS
// ─────────────────────────────────────────────────────────────

export async function getLeaveRequests(status?: string): Promise<LeaveRequest[]> {
  await ensureDb();
  const db = getDatabase();
  if (status) {
    return db.leaves.filter((l) => l.status === status);
  }
  return db.leaves;
}

export async function submitLeaveRequest(
  studentId: string,
  startDate: string,
  endDate: string,
  reason: string
): Promise<LeaveRequest> {
  await ensureDb();
  const db = getDatabase();
  const newLeave: LeaveRequest = {
    id: `lv-${Date.now().toString().slice(-4)}`,
    studentId,
    startDate,
    endDate,
    reason,
    status: 'PENDING',
    submittedAt: new Date().toISOString(),
  };

  db.leaves.unshift(newLeave);
  saveDatabase(db);
  return newLeave;
}

export async function reviewLeaveRequest(
  leaveId: string,
  status: 'APPROVED' | 'REJECTED',
  adminRemarks: string,
  adminUser: User
): Promise<void> {
  await ensureDb();
  const db = getDatabase();
  const leave = db.leaves.find((l) => l.id === leaveId);
  if (!leave) throw new Error('Leave request not found.');

  leave.status = status;
  leave.adminRemarks = adminRemarks;
  leave.reviewedAt = new Date().toISOString();
  leave.reviewedBy = adminUser.id;

  // Interlinking: if approved, automatically mark attendance on those dates as "LEAVE"
  if (status === 'APPROVED') {
    const student = db.students.find((s) => s.id === leave.studentId);
    if (student) {
      // Find or create attendance record on start date
      const existing = db.attendance.find(
        (a) => a.studentId === student.id && a.date === leave.startDate
      );
      if (existing) {
        existing.status = 'LEAVE';
        existing.remarks = `Official leave approved: ${leave.reason}`;
      } else {
        db.attendance.push({
          id: `att-leave-${Date.now()}`,
          studentId: student.id,
          classId: student.classId,
          sectionId: student.sectionId,
          date: leave.startDate,
          status: 'LEAVE',
          remarks: `Official leave approved: ${leave.reason}`,
          markedBy: adminUser.id,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  }

  // Notify student
  db.notifications.push({
    id: `notif-leave-${Date.now()}`,
    userId: leave.studentId,
    title: `Leave Application ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
    message: adminRemarks || `Your leave request for ${leave.startDate} was ${status.toLowerCase()}.`,
    type: status === 'APPROVED' ? 'SUCCESS' : 'ALERT',
    link: '/student/attendance',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);

  addAuditLog('REVIEW_LEAVE', 'Attendance', `${status} leave for student (${leave.studentId})`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });
}

// ─────────────────────────────────────────────────────────────
// FEES & PAYMENTS
// ─────────────────────────────────────────────────────────────

export async function getFeeVouchers(filters?: {
  month?: string;
  classId?: string;
  studentId?: string;
  status?: string;
}): Promise<FeeVoucher[]> {
  await ensureDb();
  const db = getDatabase();
  let list = db.vouchers;

  if (filters?.month) {
    list = list.filter((v) => v.month === filters.month);
  }
  if (filters?.classId) {
    list = list.filter((v) => v.classId === filters.classId);
  }
  if (filters?.studentId) {
    list = list.filter((v) => v.studentId === filters.studentId);
  }
  if (filters?.status) {
    list = list.filter((v) => v.status === filters.status);
  }

  return list;
}

export async function getVoucherById(id: string): Promise<FeeVoucher | null> {
  await ensureDb();
  const db = getDatabase();
  return db.vouchers.find((v) => v.id === id) || null;
}

export async function generateMonthlyVouchers(
  month: string, // YYYY-MM
  dueDate: string,
  adminUser: User
): Promise<{ count: number }> {
  await ensureDb();
  const db = getDatabase();
  let createdCount = 0;

  db.students.forEach((student) => {
    if (student.status !== 'ACTIVE') return;

    // Check if voucher already exists
    const exists = db.vouchers.some((v) => v.studentId === student.id && v.month === month);
    if (exists) return;

    const tuition = 18500;
    const lab = student.classId === 'cls-10' || student.classId === 'cls-09' ? 2500 : 1500;
    const transport = student.transportRouteId ? 5500 : 0;

    // Check if there are overdue library fines
    const overdueLoans = db.loans.filter(
      (l) => l.studentId === student.id && l.status === 'OVERDUE' && l.fineAmount > 0
    );
    const libraryFine = overdueLoans.reduce((sum, l) => sum + l.fineAmount, 0);

    const items: Array<{ title: string; amount: number; headType: FeeHeadType }> = [
      { title: 'Monthly Tuition Fee', amount: tuition, headType: 'TUITION' },
      { title: 'Laboratory & Tech Fee', amount: lab, headType: 'LAB' },
    ];
    if (transport > 0) {
      items.push({ title: 'School Bus Transport', amount: transport, headType: 'TRANSPORT' });
    }
    if (libraryFine > 0) {
      items.push({ title: 'Overdue Library Fine Head', amount: libraryFine, headType: 'LIBRARY' });
    }

    const subtotal = items.reduce((s, it) => s + it.amount, 0);
    const discount = 0;
    const total = subtotal - discount;

    const voucher: FeeVoucher = {
      id: `vch-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      voucherNumber: `VCH-${month.replace('-', '')}-${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: student.id,
      classId: student.classId,
      sectionId: student.sectionId,
      month,
      issueDate: `${month}-01`,
      dueDate,
      items,
      subtotal,
      discount,
      fine: 0,
      totalAmount: total,
      paidAmount: 0,
      remainingAmount: total,
      status: 'UNPAID',
    };

    db.vouchers.push(voucher);
    createdCount++;

    // Notify student
    db.notifications.push({
      id: `notif-vch-${Date.now()}-${student.id}`,
      userId: student.id,
      title: `Fee Voucher Issued (${month})`,
      message: `Your fee voucher of PKR ${total.toLocaleString()} is ready. Due date is ${dueDate}.`,
      type: 'INFO',
      link: '/student/fees',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  saveDatabase(db);

  addAuditLog('GENERATE_VOUCHERS', 'Fees', `Generated ${createdCount} monthly vouchers for ${month}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });

  return { count: createdCount };
}

export async function recordFeePayment(
  voucherId: string,
  amount: number,
  paymentMethod: 'ONLINE_CARD' | 'JAZZCASH' | 'EASYPAISA' | 'BANK_TRANSFER' | 'CASH',
  notes: string = '',
  user: User
): Promise<PaymentTransaction> {
  await ensureDb();
  const db = getDatabase();
  const voucher = db.vouchers.find((v) => v.id === voucherId);
  if (!voucher) throw new Error('Fee voucher not found.');

  const txId = `txn-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const receiptNum = `RCPT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

  const transaction: PaymentTransaction = {
    id: txId,
    voucherId,
    studentId: voucher.studentId,
    amount,
    paymentMethod,
    transactionRef: `AHA-TXN-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toISOString(),
    receivedBy: user.fullName,
    receiptNumber: receiptNum,
    notes,
  };

  db.transactions.push(transaction);

  // Update voucher
  voucher.paidAmount = (voucher.paidAmount || 0) + amount;
  voucher.remainingAmount = Math.max(0, voucher.totalAmount - voucher.paidAmount);
  voucher.paymentMethod = paymentMethod;
  voucher.paidAt = new Date().toISOString();
  voucher.transactionRef = transaction.transactionRef;

  if (voucher.remainingAmount === 0) {
    voucher.status = 'PAID';
  } else {
    voucher.status = 'PARTIAL';
  }

  // Notify student
  db.notifications.push({
    id: `notif-pay-${Date.now()}`,
    userId: voucher.studentId,
    title: 'Payment Successful',
    message: `Received PKR ${amount.toLocaleString()} for voucher ${voucher.voucherNumber}. Receipt #${receiptNum}.`,
    type: 'SUCCESS',
    link: '/student/fees',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);

  addAuditLog('RECORD_PAYMENT', 'Fees', `Recorded payment of PKR ${amount} for voucher ${voucher.voucherNumber} via ${paymentMethod}`, {
    id: user.id,
    name: user.fullName,
    role: user.role,
  });

  return transaction;
}

// ─────────────────────────────────────────────────────────────
// EXAMINATIONS & RESULTS
// ─────────────────────────────────────────────────────────────

export async function getExams(): Promise<Exam[]> {
  await ensureDb();
  return getDatabase().exams;
}

export async function createExam(data: Omit<Exam, 'id'>, adminUser: User): Promise<Exam> {
  await ensureDb();
  const db = getDatabase();
  const newExam: Exam = {
    ...data,
    id: `exam-${Date.now().toString().slice(-4)}`,
  };
  db.exams.push(newExam);
  saveDatabase(db);

  addAuditLog('CREATE_EXAM', 'Examinations', `Created examination term: ${newExam.title}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });

  return newExam;
}

export async function toggleExamPublish(examId: string, isPublished: boolean, adminUser: User): Promise<void> {
  await ensureDb();
  const db = getDatabase();
  const exam = db.exams.find((e) => e.id === examId);
  if (!exam) throw new Error('Exam not found.');

  exam.isPublished = isPublished;
  saveDatabase(db);

  addAuditLog('TOGGLE_EXAM_PUBLISH', 'Examinations', `${isPublished ? 'Published' : 'Unpublished'} results for: ${exam.title}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });
}

export async function getStudentResults(filters?: {
  examId?: string;
  studentId?: string;
  classId?: string;
}): Promise<StudentExamResult[]> {
  await ensureDb();
  const db = getDatabase();
  let list = db.results;

  if (filters?.examId) {
    list = list.filter((r) => r.examId === filters.examId);
  }
  if (filters?.studentId) {
    list = list.filter((r) => r.studentId === filters.studentId);
  }
  if (filters?.classId) {
    list = list.filter((r) => r.classId === filters.classId);
  }

  return list;
}

export async function saveStudentResult(
  data: Omit<StudentExamResult, 'id' | 'percentage' | 'grade' | 'gpa' | 'classRank' | 'status' | 'totalMaxMarks' | 'totalObtainedMarks'>,
  adminUser: User
): Promise<StudentExamResult> {
  await ensureDb();
  const db = getDatabase();

  const totalMax = data.marks.reduce((s, m) => s + m.totalMarks, 0);
  const totalObt = data.marks.reduce((s, m) => s + m.obtainedMarks, 0);
  const percentage = Number(((totalObt / (totalMax || 1)) * 100).toFixed(1));

  let grade = 'B';
  let gpa = 3.0;
  if (percentage >= 90) { grade = 'A+'; gpa = 4.0; }
  else if (percentage >= 80) { grade = 'A'; gpa = 3.7; }
  else if (percentage >= 70) { grade = 'B'; gpa = 3.0; }
  else if (percentage >= 60) { grade = 'C'; gpa = 2.0; }
  else if (percentage >= 50) { grade = 'D'; gpa = 1.0; }
  else { grade = 'F'; gpa = 0.0; }

  const status = percentage >= 50 ? 'PASSED' : 'FAILED';

  const newResult: StudentExamResult = {
    ...data,
    id: `res-${Date.now().toString().slice(-5)}`,
    totalMaxMarks: totalMax,
    totalObtainedMarks: totalObt,
    percentage,
    grade,
    gpa,
    classRank: 1, // updated below
    status,
  };

  // Replace or append
  const existingIdx = db.results.findIndex(
    (r) => r.examId === data.examId && r.studentId === data.studentId
  );
  if (existingIdx !== -1) {
    db.results[existingIdx] = newResult;
  } else {
    db.results.push(newResult);
  }

  // Recalculate ranks in this class
  const classResults = db.results.filter(
    (r) => r.examId === data.examId && r.classId === data.classId
  );
  classResults.sort((a, b) => b.totalObtainedMarks - a.totalObtainedMarks);
  classResults.forEach((r, idx) => {
    r.classRank = idx + 1;
  });

  saveDatabase(db);

  addAuditLog('ENTER_MARKS', 'Examinations', `Entered marks for student ${data.studentId}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });

  return newResult;
}

// ─────────────────────────────────────────────────────────────
// ASSIGNMENTS & HOMEWORK
// ─────────────────────────────────────────────────────────────

export async function getAssignments(classId?: string): Promise<Assignment[]> {
  await ensureDb();
  const db = getDatabase();
  if (classId) {
    return db.assignments.filter((a) => a.classId === classId);
  }
  return db.assignments;
}

export async function createAssignment(data: Omit<Assignment, 'id' | 'createdAt'>, user: User): Promise<Assignment> {
  await ensureDb();
  const db = getDatabase();
  const newAssignment: Assignment = {
    ...data,
    id: `asg-${Date.now().toString().slice(-4)}`,
    createdAt: new Date().toISOString().split('T')[0],
  };

  db.assignments.unshift(newAssignment);

  // Notify students of this class
  const classStudents = db.students.filter((s) => s.classId === data.classId);
  classStudents.forEach((stu) => {
    db.notifications.push({
      id: `notif-asg-${Date.now()}-${stu.id}`,
      userId: stu.id,
      title: 'New Homework Assigned',
      message: `${newAssignment.title} has been assigned. Due on ${newAssignment.dueDate}.`,
      type: 'INFO',
      link: '/student/homework',
      isRead: false,
      createdAt: new Date().toISOString(),
    });
  });

  saveDatabase(db);
  return newAssignment;
}

export async function getSubmissions(assignmentId?: string, studentId?: string): Promise<AssignmentSubmission[]> {
  await ensureDb();
  const db = getDatabase();
  let list = db.submissions;
  if (assignmentId) list = list.filter((s) => s.assignmentId === assignmentId);
  if (studentId) list = list.filter((s) => s.studentId === studentId);
  return list;
}

export async function submitAssignment(
  assignmentId: string,
  studentId: string,
  content: string,
  fileName?: string
): Promise<AssignmentSubmission> {
  await ensureDb();
  const db = getDatabase();

  const submission: AssignmentSubmission = {
    id: `subm-${Date.now().toString().slice(-4)}`,
    assignmentId,
    studentId,
    submissionDate: new Date().toISOString(),
    content,
    fileName,
    status: 'SUBMITTED',
  };

  db.submissions.unshift(submission);
  saveDatabase(db);
  return submission;
}

export async function gradeSubmission(
  submissionId: string,
  score: number,
  feedback: string,
  user: User
): Promise<void> {
  await ensureDb();
  const db = getDatabase();
  const subm = db.submissions.find((s) => s.id === submissionId);
  if (!subm) throw new Error('Submission not found.');

  subm.score = score;
  subm.feedback = feedback;
  subm.status = 'GRADED';

  // Notify student
  db.notifications.push({
    id: `notif-grade-${Date.now()}`,
    userId: subm.studentId,
    title: 'Homework Graded',
    message: `Your submission has been evaluated. Score: ${score}`,
    type: 'SUCCESS',
    link: '/student/homework',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);
}

// ─────────────────────────────────────────────────────────────
// NOTICES & EVENTS
// ─────────────────────────────────────────────────────────────

export async function getNotices(classId?: string, studentId?: string): Promise<SchoolNotice[]> {
  await ensureDb();
  const db = getDatabase();
  return db.notices.filter((n) => {
    if (n.target === 'ALL') return true;
    if (n.target === 'CLASS' && classId && n.targetClassId === classId) return true;
    if (n.target === 'STUDENT' && studentId && n.targetStudentId === studentId) return true;
    return false;
  });
}

export async function createNotice(data: Omit<SchoolNotice, 'id' | 'publishDate'>, adminUser: User): Promise<SchoolNotice> {
  await ensureDb();
  const db = getDatabase();
  const newNotice: SchoolNotice = {
    ...data,
    id: `not-${Date.now().toString().slice(-4)}`,
    publishDate: new Date().toISOString().split('T')[0],
  };

  db.notices.unshift(newNotice);

  // Emit broadcast notifications
  db.notifications.push({
    id: `notif-notice-${Date.now()}`,
    userId: 'ALL',
    title: `Notice: ${newNotice.title}`,
    message: newNotice.content.slice(0, 100) + '...',
    type: newNotice.priority === 'URGENT' ? 'ALERT' : 'INFO',
    link: '/student/notices',
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  saveDatabase(db);

  addAuditLog('PUBLISH_NOTICE', 'Announcements', `Published notice: ${newNotice.title}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });

  return newNotice;
}

export async function deleteNotice(id: string, adminUser: User): Promise<void> {
  await ensureDb();
  const db = getDatabase();
  db.notices = db.notices.filter((n) => n.id !== id);
  saveDatabase(db);

  addAuditLog('DELETE_NOTICE', 'Announcements', `Deleted notice ${id}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });
}

export async function getEvents(): Promise<SchoolEvent[]> {
  await ensureDb();
  return getDatabase().events;
}

export async function createEvent(data: Omit<SchoolEvent, 'id'>, adminUser: User): Promise<SchoolEvent> {
  await ensureDb();
  const db = getDatabase();
  const newEvent: SchoolEvent = {
    ...data,
    id: `ev-${Date.now().toString().slice(-4)}`,
  };
  db.events.push(newEvent);
  saveDatabase(db);

  addAuditLog('CREATE_EVENT', 'Calendar', `Added calendar event: ${newEvent.title}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });

  return newEvent;
}

// ─────────────────────────────────────────────────────────────
// LIBRARY
// ─────────────────────────────────────────────────────────────

export async function getLibraryBooks(search?: string): Promise<LibraryBook[]> {
  await ensureDb();
  const db = getDatabase();
  if (search) {
    const q = search.toLowerCase();
    return db.books.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.includes(q) ||
        b.category.toLowerCase().includes(q)
    );
  }
  return db.books;
}

export async function createLibraryBook(data: Omit<LibraryBook, 'id'>, adminUser: User): Promise<LibraryBook> {
  await ensureDb();
  const db = getDatabase();
  const newBook: LibraryBook = {
    ...data,
    id: `bk-${Date.now().toString().slice(-4)}`,
  };
  db.books.push(newBook);
  saveDatabase(db);

  addAuditLog('ADD_BOOK', 'Library', `Added book to catalogue: ${newBook.title}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });

  return newBook;
}

export async function getBookLoans(studentId?: string, status?: string): Promise<BookLoan[]> {
  await ensureDb();
  const db = getDatabase();
  let list = db.loans;
  if (studentId) list = list.filter((l) => l.studentId === studentId);
  if (status) list = list.filter((l) => l.status === status);
  return list;
}

export async function issueBook(
  bookId: string,
  studentId: string,
  dueDate: string,
  adminUser: User
): Promise<BookLoan> {
  await ensureDb();
  const db = getDatabase();
  const book = db.books.find((b) => b.id === bookId);
  if (!book) throw new Error('Book not found.');
  if (book.availableCopies <= 0) throw new Error('No copies available for issue.');

  book.availableCopies--;

  const loan: BookLoan = {
    id: `ln-${Date.now().toString().slice(-4)}`,
    bookId,
    studentId,
    issueDate: new Date().toISOString().split('T')[0],
    dueDate,
    fineAmount: 0,
    status: 'ISSUED',
  };

  db.loans.push(loan);
  saveDatabase(db);

  addAuditLog('ISSUE_BOOK', 'Library', `Issued book "${book.title}" to student ${studentId}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });

  return loan;
}

export async function returnBook(loanId: string, fineAmount: number = 0, adminUser: User): Promise<void> {
  await ensureDb();
  const db = getDatabase();
  const loan = db.loans.find((l) => l.id === loanId);
  if (!loan) throw new Error('Loan record not found.');

  loan.status = 'RETURNED';
  loan.returnDate = new Date().toISOString().split('T')[0];
  loan.fineAmount = fineAmount;

  const book = db.books.find((b) => b.id === loan.bookId);
  if (book) {
    book.availableCopies++;
  }

  saveDatabase(db);

  addAuditLog('RETURN_BOOK', 'Library', `Returned loan ${loanId} (fine: PKR ${fineAmount})`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });
}

// ─────────────────────────────────────────────────────────────
// TRANSPORT
// ─────────────────────────────────────────────────────────────

export async function getTransportRoutes(): Promise<TransportRoute[]> {
  await ensureDb();
  return getDatabase().routes;
}

export async function createTransportRoute(data: Omit<TransportRoute, 'id'>, adminUser: User): Promise<TransportRoute> {
  await ensureDb();
  const db = getDatabase();
  const newRoute: TransportRoute = {
    ...data,
    id: `rt-${Date.now().toString().slice(-4)}`,
  };
  db.routes.push(newRoute);
  saveDatabase(db);

  addAuditLog('CREATE_ROUTE', 'Transport', `Created transit route: ${newRoute.routeName}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });

  return newRoute;
}

export async function assignStudentTransport(
  studentId: string,
  routeId: string | undefined,
  stopId: string | undefined,
  adminUser: User
): Promise<void> {
  await ensureDb();
  const db = getDatabase();
  const student = db.students.find((s) => s.id === studentId);
  if (!student) throw new Error('Student not found.');

  student.transportRouteId = routeId;
  student.transportStopId = stopId;

  saveDatabase(db);

  addAuditLog('ASSIGN_TRANSPORT', 'Transport', `Updated transport assignment for ${student.fullName}`, {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });
}

// ─────────────────────────────────────────────────────────────
// MESSAGES & SUPPORT TICKETS
// ─────────────────────────────────────────────────────────────

export async function getSupportTickets(studentId?: string): Promise<SupportTicket[]> {
  await ensureDb();
  const db = getDatabase();
  if (studentId) {
    return db.tickets.filter((t) => t.studentId === studentId);
  }
  return db.tickets;
}

export async function createSupportTicket(
  studentId: string,
  subject: string,
  category: SupportTicket['category'],
  initialMessageText: string,
  studentName: string
): Promise<SupportTicket> {
  await ensureDb();
  const db = getDatabase();

  const newTicket: SupportTicket = {
    id: `tkt-${Date.now().toString().slice(-4)}`,
    studentId,
    subject,
    category,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    messages: [
      {
        id: `msg-${Date.now()}`,
        senderId: studentId,
        senderName: studentName,
        senderRole: 'STUDENT',
        text: initialMessageText,
        timestamp: new Date().toISOString(),
      },
    ],
  };

  db.tickets.unshift(newTicket);
  saveDatabase(db);
  return newTicket;
}

export async function addTicketMessage(
  ticketId: string,
  text: string,
  sender: { id: string; name: string; role: any }
): Promise<void> {
  await ensureDb();
  const db = getDatabase();
  const ticket = db.tickets.find((t) => t.id === ticketId);
  if (!ticket) throw new Error('Ticket not found.');

  ticket.messages.push({
    id: `msg-${Date.now()}`,
    senderId: sender.id,
    senderName: sender.name,
    senderRole: sender.role,
    text,
    timestamp: new Date().toISOString(),
  });

  if (sender.role === 'ADMIN' && ticket.status === 'OPEN') {
    ticket.status = 'IN_PROGRESS';
  }

  saveDatabase(db);
}

// ─────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<NotificationItem[]> {
  await ensureDb();
  const db = getDatabase();
  return db.notifications.filter((n) => n.userId === userId || n.userId === 'ALL');
}

export async function markNotificationRead(id: string): Promise<void> {
  await ensureDb();
  const db = getDatabase();
  const notif = db.notifications.find((n) => n.id === id);
  if (notif) {
    notif.isRead = true;
    saveDatabase(db);
  }
}

// ─────────────────────────────────────────────────────────────
// KPIS & ANALYTICS & SMART INSIGHTS
// ─────────────────────────────────────────────────────────────

export async function getAdminKPIs() {
  await ensureDb();
  const db = getDatabase();

  const activeStudents = db.students.filter((s) => s.status === 'ACTIVE');
  const totalStudents = activeStudents.length;

  // Attendance for today or latest recorded day
  const latestDate = '2026-10-26';
  const todayRecords = db.attendance.filter((a) => a.date === latestDate);
  const presentCount = todayRecords.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendancePercent = todayRecords.length > 0 ? Math.round((presentCount / todayRecords.length) * 100) : 94;

  // Fees for October 2026
  const octVouchers = db.vouchers.filter((v) => v.month === '2026-10');
  const collectedThisMonth = octVouchers.reduce((s, v) => s + (v.paidAmount || 0), 0);
  const outstandingDues = octVouchers.reduce((s, v) => s + (v.remainingAmount || 0), 0);

  // Overdue count
  const overdueCount = db.vouchers.filter((v) => v.status === 'OVERDUE').length;

  // Low attendance students count
  const defaulters = await getDefaulterStudents(75);

  // Smart Insights (Rule-based predictive & early warning)
  const insights = [
    {
      type: 'warning',
      title: 'Fee Collection Window Closing',
      description: `PKR ${outstandingDues.toLocaleString()} in dues remain unpaid for October. Due date approaches in 3 days.`,
    },
    {
      type: 'alert',
      title: `${defaulters.length} Students Below 75% Attendance`,
      description: 'Defaulters identified in Classes 8 & 10 requiring guardian counseling before board mock exams.',
    },
    {
      type: 'success',
      title: 'Class 10 Science Subject Average: 84.6%',
      description: 'Midterm Board Mock examination scores show a +6.4% gain compared to Term 1 assessments.',
    },
    {
      type: 'info',
      title: 'Transport Capacity Alert',
      description: 'Route 1 (F-Sector) is operating at 92% seating capacity. Consider assigning spare van ISB-3390.',
    },
  ];

  return {
    totalStudents,
    attendancePercent,
    collectedThisMonth,
    outstandingDues,
    overdueCount,
    defaultersCount: defaulters.length,
    upcomingEventsCount: db.events.length,
    activeTeachersCount: db.teachers.length,
    insights,
  };
}

export async function getStudentKPIs(studentId: string) {
  await ensureDb();
  const db = getDatabase();
  const student = db.students.find((s) => s.id === studentId);
  if (!student) throw new Error('Student not found');

  const attendanceRecords = db.attendance.filter((a) => a.studentId === studentId);
  const presentCount = attendanceRecords.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
  const attendanceRate = attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : 95;

  const vouchers = db.vouchers.filter((v) => v.studentId === studentId);
  const unpaidVouchers = vouchers.filter((v) => v.status === 'UNPAID' || v.status === 'PARTIAL' || v.status === 'OVERDUE');
  const totalDues = unpaidVouchers.reduce((s, v) => s + v.remainingAmount, 0);

  const assignments = db.assignments.filter((a) => a.classId === student.classId);
  const submissions = db.submissions.filter((s) => s.studentId === studentId);
  const pendingAssignmentsCount = assignments.filter(
    (a) => !submissions.some((s) => s.assignmentId === a.id)
  ).length;

  const results = db.results.filter((r) => r.studentId === studentId);
  const latestResult = results[0];

  const studentInsights = [
    {
      type: attendanceRate >= 90 ? 'success' : 'warning',
      title: `Attendance Health: ${attendanceRate}%`,
      description: attendanceRate >= 90 ? 'Eligible for Academic Distinction honor roll.' : 'Warning: Keep above 75% to appear for board examinations.',
    },
    {
      type: totalDues === 0 ? 'success' : 'alert',
      title: totalDues === 0 ? 'Fee Dues Clear' : `Pending Dues: PKR ${totalDues.toLocaleString()}`,
      description: totalDues === 0 ? 'No outstanding school fee vouchers.' : 'Kindly pay before mid-term assessments.',
    },
    {
      type: 'info',
      title: 'Performance Trajectory: Upward',
      description: `Rank #${latestResult?.classRank || 1} in class with cumulative GPA ${latestResult?.gpa || 3.8}.`,
    },
  ];

  return {
    student,
    attendanceRate,
    totalDues,
    pendingAssignmentsCount,
    latestResult,
    insights: studentInsights,
  };
}

// ─────────────────────────────────────────────────────────────
// SETTINGS & BACKUP/RESTORE
// ─────────────────────────────────────────────────────────────

export async function getSystemSettings(): Promise<SystemSettings> {
  await ensureDb();
  return getDatabase().settings;
}

export async function updateSystemSettings(newSettings: SystemSettings, adminUser: User): Promise<void> {
  await ensureDb();
  const db = getDatabase();
  db.settings = newSettings;
  saveDatabase(db);

  addAuditLog('UPDATE_SETTINGS', 'Settings', 'Updated institution settings and fee parameters', {
    id: adminUser.id,
    name: adminUser.fullName,
    role: adminUser.role,
  });
}

export async function getAuditLogs(): Promise<AuditLogEntry[]> {
  await ensureDb();
  return getDatabase().auditLogs;
}

export async function exportDatabaseBackup(): Promise<string> {
  await ensureDb();
  return JSON.stringify(getDatabase(), null, 2);
}

export async function importDatabaseBackup(jsonString: string, adminUser: User): Promise<void> {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.version || !parsed.users || !parsed.students) {
      throw new Error('Invalid Aurelian Heights backup file structure.');
    }
    saveDatabase(parsed);

    addAuditLog('IMPORT_BACKUP', 'Settings', 'Restored complete database from JSON backup file', {
      id: adminUser.id,
      name: adminUser.fullName,
      role: adminUser.role,
    });
  } catch (err: any) {
    throw new Error(`Backup import failed: ${err.message}`);
  }
}

export async function resetDatabase(): Promise<void> {
  await resetDemoData();
}
