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
} from '../types';
import {
  INITIAL_SETTINGS,
  INITIAL_TEACHERS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_ROUTES,
  INITIAL_BOOKS,
  generateSeedStudents,
  generateSeedAttendance,
  generateSeedFeeVouchers,
  INITIAL_EXAMS,
  generateSeedExamResults,
  INITIAL_NOTICES,
  INITIAL_EVENTS,
  INITIAL_ASSIGNMENTS,
  INITIAL_SUBMISSIONS,
  INITIAL_LOANS,
  INITIAL_LEAVES,
  INITIAL_TICKETS,
  INITIAL_AUDIT_LOGS,
} from './seedData';
import { hashPassword } from '../utils/security';

const STORAGE_KEY = 'AURELIAN_HEIGHTS_DB_V2';

export interface DatabaseSchema {
  version: string;
  settings: SystemSettings;
  users: User[];
  passwordHashes: Record<string, string>; // userId -> hash
  teachers: Teacher[];
  classes: SchoolClass[];
  subjects: Subject[];
  students: Student[];
  attendance: AttendanceRecord[];
  vouchers: FeeVoucher[];
  transactions: PaymentTransaction[];
  exams: Exam[];
  results: StudentExamResult[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  notices: SchoolNotice[];
  events: SchoolEvent[];
  books: LibraryBook[];
  loans: BookLoan[];
  routes: TransportRoute[];
  leaves: LeaveRequest[];
  tickets: SupportTicket[];
  notifications: NotificationItem[];
  auditLogs: AuditLogEntry[];
}

// In-memory cache + persistent storage synchronizer
let dbInstance: DatabaseSchema | null = null;

export async function initializeDatabase(): Promise<DatabaseSchema> {
  // 1. Attempt to hydrate from server-side database backend
  try {
    const res = await fetch('/api/db');
    if (res.ok) {
      const serverDb = await res.json();
      if (serverDb && serverDb.users && serverDb.users.length > 0) {
        dbInstance = serverDb;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serverDb));
        return serverDb;
      }
    }
  } catch (err) {
    // Non-fatal if offline or backend route not ready
  }

  // 2. Attempt to hydrate from local storage
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) {
    try {
      dbInstance = JSON.parse(existing);
      // Ensure saqibsb13b admin exists in existing cache
      const hasSaqib = dbInstance?.users.some((u) => u.email === 'saqibsb13b@gmail.com');
      if (hasSaqib) {
        return dbInstance!;
      }
    } catch (e) {
      console.error('Failed to parse existing DB from localStorage, re-seeding:', e);
    }
  }

  // Build clean seed database
  const students = generateSeedStudents();
  const attendance = generateSeedAttendance(students);
  const vouchers = generateSeedFeeVouchers(students);
  const results = generateSeedExamResults(students, INITIAL_EXAMS);

  // Primary Admin User (Saqib)
  const adminUser: User = {
    id: 'admin-01',
    email: 'saqibsb13b@gmail.com',
    phone: '+92 348 2802484',
    role: 'ADMIN',
    fullName: 'Saqib (Administrator & Principal)',
    avatarUrl: '',
    mustChangePassword: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    failedLoginAttempts: 0,
    lockedUntil: null,
  };

  // Secondary System Admin User (Fallback)
  const systemAdminUser: User = {
    id: 'admin-02',
    email: 'admin@aurelianheights.edu',
    phone: '+92 300 1234567',
    role: 'ADMIN',
    fullName: 'Academy Superadmin (System)',
    avatarUrl: '',
    mustChangePassword: false,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    failedLoginAttempts: 0,
    lockedUntil: null,
  };

  const users: User[] = [adminUser, systemAdminUser, ...students];

  // Hash passwords
  // Admin 1 (Saqib): "@Saqibsb13b"
  // Admin 2 (System): "Admin@12345"
  // Students: default "Student@12345"
  const passwordHashes: Record<string, string> = {};
  passwordHashes['admin-01'] = await hashPassword('@Saqibsb13b');
  passwordHashes['admin-02'] = await hashPassword('Admin@12345');

  const defaultStudentHash = await hashPassword('Student@12345');
  students.forEach((stu) => {
    passwordHashes[stu.id] = defaultStudentHash;
  });

  const initialNotifications: NotificationItem[] = [
    {
      id: 'notif-01',
      userId: 'stu-001',
      title: 'Midterm Examination Schedule Released',
      message: 'Official exam schedule is now published. Check your datesheet and instructions.',
      type: 'INFO',
      link: '/student/results',
      isRead: false,
      createdAt: '2026-10-25T10:00:00Z',
    },
    {
      id: 'notif-02',
      userId: 'stu-001',
      title: 'October Fee Voucher Available',
      message: 'Monthly fee voucher for October is ready. Kindly pay before due date.',
      type: 'WARNING',
      link: '/student/fees',
      isRead: false,
      createdAt: '2026-10-02T08:00:00Z',
    },
  ];

  dbInstance = {
    version: '1.0.0',
    settings: INITIAL_SETTINGS,
    users,
    passwordHashes,
    teachers: INITIAL_TEACHERS,
    classes: INITIAL_CLASSES,
    subjects: INITIAL_SUBJECTS,
    students,
    attendance,
    vouchers,
    transactions: [],
    exams: INITIAL_EXAMS,
    results,
    assignments: INITIAL_ASSIGNMENTS,
    submissions: INITIAL_SUBMISSIONS,
    notices: INITIAL_NOTICES,
    events: INITIAL_EVENTS,
    books: INITIAL_BOOKS,
    loans: INITIAL_LOANS,
    routes: INITIAL_ROUTES,
    leaves: INITIAL_LEAVES,
    tickets: INITIAL_TICKETS,
    notifications: initialNotifications,
    auditLogs: INITIAL_AUDIT_LOGS,
  };

  saveDatabase(dbInstance);
  return dbInstance;
}

export function getDatabase(): DatabaseSchema {
  if (!dbInstance) {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      dbInstance = JSON.parse(existing);
    } else {
      // Synchronous skeleton until async init finishes
      throw new Error('Database not initialized. Please call initializeDatabase() on app mount.');
    }
  }
  return dbInstance!;
}

export function saveDatabase(db: DatabaseSchema): void {
  dbInstance = db;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }

  // Asynchronous background sync to server-side backend database
  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(db),
    }).catch((e) => {
      // Background sync error ignored in pure offline situations
    });
  }
}

export async function resetDemoData(): Promise<DatabaseSchema> {
  localStorage.removeItem(STORAGE_KEY);
  dbInstance = null;
  try {
    await fetch('/api/db/reset', { method: 'POST' });
  } catch (e) {
    // ignore
  }
  return initializeDatabase();
}

export function addAuditLog(
  action: string,
  module: string,
  details: string,
  user?: { id: string; name: string; role: any }
): void {
  const db = getDatabase();
  const newLog: AuditLogEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    userId: user?.id || 'sys',
    userName: user?.name || 'System Worker',
    userRole: user?.role || 'ADMIN',
    action,
    module,
    details,
    timestamp: new Date().toISOString(),
  };
  db.auditLogs.unshift(newLog);
  // Keep last 500 audit logs
  if (db.auditLogs.length > 500) {
    db.auditLogs = db.auditLogs.slice(0, 500);
  }
  saveDatabase(db);
}
