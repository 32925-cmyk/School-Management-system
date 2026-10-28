/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'ADMIN' | 'STUDENT' | 'TEACHER' | 'PARENT';

export interface User {
  id: string;
  email: string;
  phone?: string;
  role: UserRole;
  fullName: string;
  avatarUrl?: string;
  mustChangePassword?: boolean;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string | null;
}

export interface Student extends User {
  role: 'STUDENT';
  rollNumber: string;
  admissionNumber: string;
  classId: string;
  sectionId: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  address: string;
  bloodGroup?: string;
  transportRouteId?: string;
  transportStopId?: string;
  documents?: StudentDocument[];
  enrollmentDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ALUMNI' | 'SUSPENDED';
}

export interface StudentDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  fileData?: string; // base64 or object url
}

export interface Teacher {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  designation: string;
  joiningDate: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
}

export interface SchoolClass {
  id: string;
  name: string; // e.g. "Class 10"
  numericGrade: number; // e.g. 10
  sections: SchoolSection[];
}

export interface SchoolSection {
  id: string;
  name: string; // e.g. "Section A"
  classId: string;
  capacity: number;
  roomNumber: string;
  classTeacherId: string; // teacher id
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classId: string;
  creditHours: number;
  teacherId?: string;
  isOptional?: boolean;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  classId: string;
  sectionId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
  markedBy: string; // User ID / Admin
  updatedAt: string;
}

export interface TimetableSlot {
  id: string;
  classId: string;
  sectionId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g. "08:30"
  endTime: string; // e.g. "09:15"
  subjectId: string;
  teacherId: string;
  roomNumber: string;
}

export type FeeHeadType = 'TUITION' | 'TRANSPORT' | 'LAB' | 'EXAMINATION' | 'LIBRARY' | 'SPORTS' | 'OTHER';

export interface FeeStructureItem {
  id: string;
  classId: string;
  headName: string;
  headType: FeeHeadType;
  amount: number;
  frequency: 'MONTHLY' | 'TERM' | 'ANNUAL';
}

export type VoucherStatus = 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE';

export interface FeeVoucher {
  id: string;
  voucherNumber: string; // e.g. "VCH-2026-0891"
  studentId: string;
  classId: string;
  sectionId: string;
  month: string; // e.g. "2026-10" or "October 2026"
  issueDate: string;
  dueDate: string;
  items: {
    title: string;
    amount: number;
    headType: FeeHeadType;
  }[];
  subtotal: number;
  discount: number;
  fine: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: VoucherStatus;
  paymentMethod?: string;
  paidAt?: string;
  transactionRef?: string;
}

export interface PaymentTransaction {
  id: string;
  voucherId: string;
  studentId: string;
  amount: number;
  paymentMethod: 'ONLINE_CARD' | 'JAZZCASH' | 'EASYPAISA' | 'BANK_TRANSFER' | 'CASH';
  transactionRef: string;
  timestamp: string;
  receivedBy: string;
  receiptNumber: string;
  notes?: string;
}

export interface Exam {
  id: string;
  title: string; // e.g. "Midterm Examinations 2026"
  academicSession: string; // e.g. "2026-2027"
  startDate: string;
  endDate: string;
  isPublished: boolean;
  classIds: string[];
}

export interface ExamSubjectMark {
  subjectId: string;
  totalMarks: number;
  obtainedMarks: number;
  passingMarks: number;
  grade: string;
  remarks?: string;
}

export interface StudentExamResult {
  id: string;
  examId: string;
  studentId: string;
  classId: string;
  sectionId: string;
  marks: ExamSubjectMark[];
  totalMaxMarks: number;
  totalObtainedMarks: number;
  percentage: number;
  grade: string;
  gpa: number;
  classRank: number;
  status: 'PASSED' | 'FAILED' | 'PROVISIONAL';
  teacherRemarks?: string;
  publishedAt?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  classId: string;
  sectionId?: string; // optional, applies to all sections if omitted
  subjectId: string;
  assignedBy: string; // teacher id or admin
  dueDate: string;
  maxScore: number;
  attachments?: string[];
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  submissionDate: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  score?: number;
  feedback?: string;
  status: 'SUBMITTED' | 'GRADED' | 'RESUBMISSION_REQUESTED';
}

export interface SchoolNotice {
  id: string;
  title: string;
  content: string;
  target: 'ALL' | 'CLASS' | 'STUDENT';
  targetClassId?: string;
  targetStudentId?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isPinned: boolean;
  publishDate: string;
  expiryDate?: string;
  authorName: string;
}

export interface SchoolEvent {
  id: string;
  title: string;
  description: string;
  type: 'HOLIDAY' | 'EXAM' | 'PTM' | 'SPORTS' | 'CULTURAL' | 'ACADEMIC';
  startDate: string;
  endDate: string;
  venue?: string;
  allDay: boolean;
}

export interface LibraryBook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
}

export interface BookLoan {
  id: string;
  bookId: string;
  studentId: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: 'ISSUED' | 'RETURNED' | 'OVERDUE';
}

export interface TransportRoute {
  id: string;
  routeName: string;
  routeCode: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  monthlyFee: number;
  stops: TransportStop[];
}

export interface TransportStop {
  id: string;
  stopName: string;
  pickupTime: string;
  dropTime: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminRemarks?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface SupportTicket {
  id: string;
  studentId: string;
  subject: string;
  category: 'FEES' | 'ACADEMIC' | 'TRANSPORT' | 'LIBRARY' | 'GENERAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  messages: {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    text: string;
    timestamp: string;
  }[];
}

export interface NotificationItem {
  id: string;
  userId: string; // target user
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'SUCCESS';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  details: string;
  ipAddress?: string;
  timestamp: string;
}

export interface SystemSettings {
  schoolName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  academicYear: string;
  currency: string;
  currencySymbol: string;
  lateFeePerDay: number;
  attendanceWarningThresholdPercent: number;
  gradingScale: {
    grade: string;
    minScore: number;
    gpa: number;
    description: string;
  }[];
}
