/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Student,
  Teacher,
  SchoolClass,
  SchoolSection,
  Subject,
  AttendanceRecord,
  FeeVoucher,
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

export const INITIAL_SETTINGS: SystemSettings = {
  schoolName: 'Aurelian Heights Academy',
  tagline: 'Where Tomorrow Learns Today',
  email: 'admin@aurelianheights.edu',
  phone: '+92 51 8923400',
  address: 'Plot 42, Sector H-8/4, Scholar Way, Islamabad, Pakistan',
  academicYear: '2026-2027',
  currency: 'PKR',
  currencySymbol: 'Rs.',
  lateFeePerDay: 50,
  attendanceWarningThresholdPercent: 75,
  gradingScale: [
    { grade: 'A+', minScore: 90, gpa: 4.0, description: 'Outstanding Academic Distinction' },
    { grade: 'A', minScore: 80, gpa: 3.7, description: 'Excellent Comprehension' },
    { grade: 'B', minScore: 70, gpa: 3.0, description: 'Very Good' },
    { grade: 'C', minScore: 60, gpa: 2.0, description: 'Satisfactory Passing' },
    { grade: 'D', minScore: 50, gpa: 1.0, description: 'Minimum Passing' },
    { grade: 'F', minScore: 0, gpa: 0.0, description: 'Fail / Needs Remedial' },
  ],
};

export const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'tch-01',
    fullName: 'Prof. Tariq Mansoor',
    email: 'tariq.mansoor@aurelianheights.edu',
    phone: '+92 300 5512391',
    qualification: 'Ph.D. Mathematics, QAU',
    specialization: 'Advanced Calculus & Algebra',
    designation: 'Head of Mathematics',
    joiningDate: '2019-08-15',
    status: 'ACTIVE',
  },
  {
    id: 'tch-02',
    fullName: 'Dr. Shahida Parveen',
    email: 'shahida.parveen@aurelianheights.edu',
    phone: '+92 321 4489102',
    qualification: 'Ph.D. Physics, NUST',
    specialization: 'Quantum Mechanics & Applied Physics',
    designation: 'Head of Sciences',
    joiningDate: '2018-09-01',
    status: 'ACTIVE',
  },
  {
    id: 'tch-03',
    fullName: 'Mr. Asif Raza',
    email: 'asif.raza@aurelianheights.edu',
    phone: '+92 333 7129034',
    qualification: 'M.S. Computer Science, FAST-NUCES',
    specialization: 'Algorithms & Python Programming',
    designation: 'Senior CS Instructor',
    joiningDate: '2021-02-10',
    status: 'ACTIVE',
  },
  {
    id: 'tch-04',
    fullName: 'Mrs. Naheed Akhtar',
    email: 'naheed.akhtar@aurelianheights.edu',
    phone: '+92 345 8891230',
    qualification: 'M.Phil. English Literature, PU',
    specialization: 'Grammar, Creative Writing & Rhetoric',
    designation: 'Senior English Faculty',
    joiningDate: '2020-01-12',
    status: 'ACTIVE',
  },
  {
    id: 'tch-05',
    fullName: 'Mr. Kamran Hashmi',
    email: 'kamran.hashmi@aurelianheights.edu',
    phone: '+92 302 9912045',
    qualification: 'M.Sc. Organic Chemistry, QAU',
    specialization: 'Organic Chemistry & Lab Diagnostics',
    designation: 'Chemistry Department Lead',
    joiningDate: '2020-07-01',
    status: 'ACTIVE',
  },
  {
    id: 'tch-06',
    fullName: 'Ms. Rabia Zubair',
    email: 'rabia.zubair@aurelianheights.edu',
    phone: '+92 313 6712399',
    qualification: 'M.Phil. Molecular Biology, LUMS',
    specialization: 'Cellular Biology & Genetics',
    designation: 'Biology Lecturer',
    joiningDate: '2022-04-15',
    status: 'ACTIVE',
  },
  {
    id: 'tch-07',
    fullName: 'Qari Abdul Rehman',
    email: 'abdul.rehman@aurelianheights.edu',
    phone: '+92 300 2314590',
    qualification: 'M.A. Islamic Studies & Arabic, IIUI',
    specialization: 'Quranic Hermeneutics & Ethics',
    designation: 'Head of Religious Studies',
    joiningDate: '2019-03-01',
    status: 'ACTIVE',
  },
  {
    id: 'tch-08',
    fullName: 'Mr. Zahid Hussain',
    email: 'zahid.hussain@aurelianheights.edu',
    phone: '+92 334 5098712',
    qualification: 'M.Sc. Pakistan Studies & History, QAU',
    specialization: 'Constitutional History & Geography',
    designation: 'Social Sciences Lead',
    joiningDate: '2021-08-20',
    status: 'ACTIVE',
  },
  {
    id: 'tch-09',
    fullName: 'Ms. Fareeha Siddiqui',
    email: 'fareeha.siddiqui@aurelianheights.edu',
    phone: '+92 322 1894567',
    qualification: 'M.A. Urdu Adab, GCU Lahore',
    specialization: 'Classical Urdu Poetry & Prose',
    designation: 'Urdu Department Coordinator',
    joiningDate: '2019-10-05',
    status: 'ACTIVE',
  },
  {
    id: 'tch-10',
    fullName: 'Mr. Bilal Farooqi',
    email: 'bilal.farooqi@aurelianheights.edu',
    phone: '+92 301 8871203',
    qualification: 'B.S. Sports Sciences, Punjab University',
    specialization: 'Athletic Conditioning & Football Coach',
    designation: 'Director of Physical Education',
    joiningDate: '2022-01-10',
    status: 'ACTIVE',
  },
  {
    id: 'tch-11',
    fullName: 'Mrs. Samina Alvi',
    email: 'samina.alvi@aurelianheights.edu',
    phone: '+92 346 7120984',
    qualification: 'M.F.A. Fine Arts, NCA Lahore',
    specialization: 'Studio Arts & Visual Design',
    designation: 'Creative Arts Coordinator',
    joiningDate: '2023-03-01',
    status: 'ACTIVE',
  },
  {
    id: 'tch-12',
    fullName: 'Mr. Zeeshan Haider',
    email: 'zeeshan.haider@aurelianheights.edu',
    phone: '+92 315 9012348',
    qualification: 'M.Sc. Applied Statistics, KU',
    specialization: 'General Science & Foundation Math',
    designation: 'Middle School STEM Tutor',
    joiningDate: '2023-09-01',
    status: 'ACTIVE',
  },
];

export const INITIAL_CLASSES: SchoolClass[] = [
  {
    id: 'cls-06',
    name: 'Class 6',
    numericGrade: 6,
    sections: [
      { id: 'sec-06-a', name: 'Section A', classId: 'cls-06', capacity: 30, roomNumber: 'Room 101', classTeacherId: 'tch-12' },
      { id: 'sec-06-b', name: 'Section B', classId: 'cls-06', capacity: 30, roomNumber: 'Room 102', classTeacherId: 'tch-04' },
    ],
  },
  {
    id: 'cls-07',
    name: 'Class 7',
    numericGrade: 7,
    sections: [
      { id: 'sec-07-a', name: 'Section A', classId: 'cls-07', capacity: 30, roomNumber: 'Room 103', classTeacherId: 'tch-08' },
      { id: 'sec-07-b', name: 'Section B', classId: 'cls-07', capacity: 30, roomNumber: 'Room 104', classTeacherId: 'tch-09' },
    ],
  },
  {
    id: 'cls-08',
    name: 'Class 8',
    numericGrade: 8,
    sections: [
      { id: 'sec-08-a', name: 'Section A', classId: 'cls-08', capacity: 30, roomNumber: 'Room 201', classTeacherId: 'tch-06' },
      { id: 'sec-08-b', name: 'Section B', classId: 'cls-08', capacity: 30, roomNumber: 'Room 202', classTeacherId: 'tch-03' },
    ],
  },
  {
    id: 'cls-09',
    name: 'Class 9',
    numericGrade: 9,
    sections: [
      { id: 'sec-09-a', name: 'Section A', classId: 'cls-09', capacity: 30, roomNumber: 'Room 203', classTeacherId: 'tch-05' },
      { id: 'sec-09-b', name: 'Section B', classId: 'cls-09', capacity: 30, roomNumber: 'Room 204', classTeacherId: 'tch-07' },
    ],
  },
  {
    id: 'cls-10',
    name: 'Class 10',
    numericGrade: 10,
    sections: [
      { id: 'sec-10-a', name: 'Section A', classId: 'cls-10', capacity: 30, roomNumber: 'Room 301', classTeacherId: 'tch-01' },
      { id: 'sec-10-b', name: 'Section B', classId: 'cls-10', capacity: 30, roomNumber: 'Room 302', classTeacherId: 'tch-02' },
    ],
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  // Class 10 Subjects
  { id: 'sub-10-math', name: 'Mathematics', code: 'MATH-10', classId: 'cls-10', creditHours: 4, teacherId: 'tch-01' },
  { id: 'sub-10-phy', name: 'Physics', code: 'PHY-10', classId: 'cls-10', creditHours: 4, teacherId: 'tch-02' },
  { id: 'sub-10-chem', name: 'Chemistry', code: 'CHEM-10', classId: 'cls-10', creditHours: 4, teacherId: 'tch-05' },
  { id: 'sub-10-bio', name: 'Biology', code: 'BIO-10', classId: 'cls-10', creditHours: 4, teacherId: 'tch-06' },
  { id: 'sub-10-cs', name: 'Computer Science', code: 'CS-10', classId: 'cls-10', creditHours: 4, teacherId: 'tch-03' },
  { id: 'sub-10-eng', name: 'English Literature', code: 'ENG-10', classId: 'cls-10', creditHours: 3, teacherId: 'tch-04' },
  { id: 'sub-10-urd', name: 'Urdu', code: 'URD-10', classId: 'cls-10', creditHours: 3, teacherId: 'tch-09' },
  { id: 'sub-10-pst', name: 'Pakistan Studies', code: 'PST-10', classId: 'cls-10', creditHours: 2, teacherId: 'tch-08' },
  { id: 'sub-10-isl', name: 'Islamiyat', code: 'ISL-10', classId: 'cls-10', creditHours: 2, teacherId: 'tch-07' },

  // Class 9 Subjects
  { id: 'sub-09-math', name: 'Mathematics', code: 'MATH-09', classId: 'cls-09', creditHours: 4, teacherId: 'tch-01' },
  { id: 'sub-09-phy', name: 'Physics', code: 'PHY-09', classId: 'cls-09', creditHours: 4, teacherId: 'tch-02' },
  { id: 'sub-09-chem', name: 'Chemistry', code: 'CHEM-09', classId: 'cls-09', creditHours: 4, teacherId: 'tch-05' },
  { id: 'sub-09-bio', name: 'Biology', code: 'BIO-09', classId: 'cls-09', creditHours: 4, teacherId: 'tch-06' },
  { id: 'sub-09-cs', name: 'Computer Science', code: 'CS-09', classId: 'cls-09', creditHours: 4, teacherId: 'tch-03' },
  { id: 'sub-09-eng', name: 'English Literature', code: 'ENG-09', classId: 'cls-09', creditHours: 3, teacherId: 'tch-04' },
  { id: 'sub-09-urd', name: 'Urdu', code: 'URD-09', classId: 'cls-09', creditHours: 3, teacherId: 'tch-09' },
  { id: 'sub-09-pst', name: 'Pakistan Studies', code: 'PST-09', classId: 'cls-09', creditHours: 2, teacherId: 'tch-08' },
  { id: 'sub-09-isl', name: 'Islamiyat', code: 'ISL-09', classId: 'cls-09', creditHours: 2, teacherId: 'tch-07' },

  // Class 8 Subjects
  { id: 'sub-08-math', name: 'General Mathematics', code: 'MATH-08', classId: 'cls-08', creditHours: 4, teacherId: 'tch-12' },
  { id: 'sub-08-sci', name: 'General Science', code: 'SCI-08', classId: 'cls-08', creditHours: 4, teacherId: 'tch-06' },
  { id: 'sub-08-eng', name: 'English', code: 'ENG-08', classId: 'cls-08', creditHours: 3, teacherId: 'tch-04' },
  { id: 'sub-08-urd', name: 'Urdu', code: 'URD-08', classId: 'cls-08', creditHours: 3, teacherId: 'tch-09' },
  { id: 'sub-08-cs', name: 'Foundations of Computing', code: 'CS-08', classId: 'cls-08', creditHours: 3, teacherId: 'tch-03' },
  { id: 'sub-08-sst', name: 'Social Studies', code: 'SST-08', classId: 'cls-08', creditHours: 2, teacherId: 'tch-08' },
  { id: 'sub-08-isl', name: 'Islamiyat', code: 'ISL-08', classId: 'cls-08', creditHours: 2, teacherId: 'tch-07' },

  // Class 7 Subjects
  { id: 'sub-07-math', name: 'General Mathematics', code: 'MATH-07', classId: 'cls-07', creditHours: 4, teacherId: 'tch-12' },
  { id: 'sub-07-sci', name: 'General Science', code: 'SCI-07', classId: 'cls-07', creditHours: 4, teacherId: 'tch-02' },
  { id: 'sub-07-eng', name: 'English', code: 'ENG-07', classId: 'cls-07', creditHours: 3, teacherId: 'tch-04' },
  { id: 'sub-07-urd', name: 'Urdu', code: 'URD-07', classId: 'cls-07', creditHours: 3, teacherId: 'tch-09' },
  { id: 'sub-07-cs', name: 'ICT Skills', code: 'CS-07', classId: 'cls-07', creditHours: 3, teacherId: 'tch-03' },
  { id: 'sub-07-sst', name: 'Social Studies', code: 'SST-07', classId: 'cls-07', creditHours: 2, teacherId: 'tch-08' },
  { id: 'sub-07-isl', name: 'Islamiyat', code: 'ISL-07', classId: 'cls-07', creditHours: 2, teacherId: 'tch-07' },

  // Class 6 Subjects
  { id: 'sub-06-math', name: 'Elementary Mathematics', code: 'MATH-06', classId: 'cls-06', creditHours: 4, teacherId: 'tch-12' },
  { id: 'sub-06-sci', name: 'General Science', code: 'SCI-06', classId: 'cls-06', creditHours: 4, teacherId: 'tch-05' },
  { id: 'sub-06-eng', name: 'English Foundations', code: 'ENG-06', classId: 'cls-06', creditHours: 3, teacherId: 'tch-04' },
  { id: 'sub-06-urd', name: 'Urdu Grammar & Composition', code: 'URD-06', classId: 'cls-06', creditHours: 3, teacherId: 'tch-09' },
  { id: 'sub-06-cs', name: 'Introductory Computing', code: 'CS-06', classId: 'cls-06', creditHours: 3, teacherId: 'tch-03' },
  { id: 'sub-06-sst', name: 'Social Studies', code: 'SST-06', classId: 'cls-06', creditHours: 2, teacherId: 'tch-08' },
  { id: 'sub-06-isl', name: 'Islamiyat', code: 'ISL-06', classId: 'cls-06', creditHours: 2, teacherId: 'tch-07' },
];

export const INITIAL_ROUTES: TransportRoute[] = [
  {
    id: 'rt-01',
    routeName: 'Route 1 - F-Sector Express',
    routeCode: 'R-101',
    vehicleNumber: 'ISB-8219 (Coaster)',
    driverName: 'Muhammad Sajjad',
    driverPhone: '+92 300 4419082',
    monthlyFee: 5500,
    stops: [
      { id: 'stp-101', stopName: 'F-10 Markaz (Shell Pump)', pickupTime: '07:15', dropTime: '14:45' },
      { id: 'stp-102', stopName: 'F-8/3 Roundabout', pickupTime: '07:30', dropTime: '14:30' },
      { id: 'stp-103', stopName: 'F-7 Jinnah Super', pickupTime: '07:45', dropTime: '14:15' },
      { id: 'stp-104', stopName: 'Aurelian Academy Main Gate', pickupTime: '08:05', dropTime: '14:00' },
    ],
  },
  {
    id: 'rt-02',
    routeName: 'Route 2 - G-Sector & I-8 Corridor',
    routeCode: 'R-102',
    vehicleNumber: 'ISB-3390 (HiAce Van)',
    driverName: 'Ghulam Abbas',
    driverPhone: '+92 321 8831209',
    monthlyFee: 5000,
    stops: [
      { id: 'stp-201', stopName: 'G-11/2 Main Chowk', pickupTime: '07:10', dropTime: '14:50' },
      { id: 'stp-202', stopName: 'G-9 Karachi Company', pickupTime: '07:30', dropTime: '14:30' },
      { id: 'stp-203', stopName: 'I-8 Markaz Habibi Rest.', pickupTime: '07:45', dropTime: '14:15' },
      { id: 'stp-204', stopName: 'Aurelian Academy Main Gate', pickupTime: '08:05', dropTime: '14:00' },
    ],
  },
  {
    id: 'rt-03',
    routeName: 'Route 3 - Bahria & DHA Link',
    routeCode: 'R-103',
    vehicleNumber: 'RAW-7721 (Air-conditioned Bus)',
    driverName: 'Rashid Mehmood',
    driverPhone: '+92 345 5190283',
    monthlyFee: 6500,
    stops: [
      { id: 'stp-301', stopName: 'Bahria Town Phase 4 Civic Center', pickupTime: '06:55', dropTime: '15:10' },
      { id: 'stp-302', stopName: 'DHA Phase 2 Gate 1', pickupTime: '07:15', dropTime: '14:50' },
      { id: 'stp-303', stopName: 'PWD Main Boulevard', pickupTime: '07:35', dropTime: '14:30' },
      { id: 'stp-304', stopName: 'Aurelian Academy Main Gate', pickupTime: '08:10', dropTime: '14:00' },
    ],
  },
];

export const INITIAL_BOOKS: LibraryBook[] = [
  { id: 'bk-01', isbn: '978-0199068012', title: 'Pakistan: A Hard Country', author: 'Anatol Lieven', category: 'History & Politics', totalCopies: 8, availableCopies: 5, shelfLocation: 'Shelf H-04' },
  { id: 'bk-02', isbn: '978-0143423232', title: 'The Idea of Pakistan', author: 'Stephen P. Cohen', category: 'History', totalCopies: 5, availableCopies: 2, shelfLocation: 'Shelf H-06' },
  { id: 'bk-03', isbn: '978-0062316097', title: 'Sapiens: A Brief History of Humankind', author: 'Yuval Noah Harari', category: 'Anthropology', totalCopies: 10, availableCopies: 7, shelfLocation: 'Shelf G-02' },
  { id: 'bk-04', isbn: '978-0385504201', title: 'The Da Vinci Code', author: 'Dan Brown', category: 'Fiction', totalCopies: 6, availableCopies: 4, shelfLocation: 'Shelf F-11' },
  { id: 'bk-05', isbn: '978-0262033848', title: 'Introduction to Algorithms (CLRS)', author: 'Cormen, Leiserson, Rivest', category: 'Computer Science', totalCopies: 12, availableCopies: 6, shelfLocation: 'Shelf CS-01' },
  { id: 'bk-06', isbn: '978-1118230725', title: 'Halliday & Resnick: Fundamentals of Physics', author: 'Jearl Walker', category: 'Physics', totalCopies: 15, availableCopies: 11, shelfLocation: 'Shelf SCI-03' },
  { id: 'bk-07', isbn: '978-0134093413', title: 'Campbell Biology (11th Edition)', author: 'Lisa A. Urry', category: 'Biology', totalCopies: 10, availableCopies: 4, shelfLocation: 'Shelf SCI-07' },
  { id: 'bk-08', isbn: '978-0471215752', title: 'Calculus: Early Transcendentals', author: 'Howard Anton', category: 'Mathematics', totalCopies: 14, availableCopies: 9, shelfLocation: 'Shelf M-02' },
  { id: 'bk-09', isbn: '978-9694160450', title: 'Kulliyat-e-Iqbal (Complete Urdu Works)', author: 'Allama Muhammad Iqbal', category: 'Urdu Literature', totalCopies: 20, availableCopies: 16, shelfLocation: 'Shelf URD-01' },
  { id: 'bk-10', isbn: '978-9693512341', title: 'Udaas Naslein', author: 'Abdullah Hussain', category: 'Urdu Literature', totalCopies: 8, availableCopies: 3, shelfLocation: 'Shelf URD-05' },
  { id: 'bk-11', isbn: '978-0199406081', title: 'Constitutional and Political History of Pakistan', author: 'Hamid Khan', category: 'Law & Civics', totalCopies: 6, availableCopies: 3, shelfLocation: 'Shelf LAW-02' },
  { id: 'bk-12', isbn: '978-0544003415', title: 'The Lord of the Rings: Fellowship of the Ring', author: 'J.R.R. Tolkien', category: 'English Fiction', totalCopies: 7, availableCopies: 4, shelfLocation: 'Shelf ENG-09' },
];

// Helper to generate 60 students
export function generateSeedStudents(): Student[] {
  const firstNamesBoys = ['Muhammad', 'Ahmed', 'Ali', 'Zayd', 'Hamza', 'Bilal', 'Ibrahim', 'Daniyal', 'Mustafa', 'Usman', 'Taha', 'Rayyan', 'Haris', 'Saad', 'Hassan', 'Shahmeer', 'Ayaan', 'Arham', 'Farhan', 'Omer'];
  const firstNamesGirls = ['Fatima', 'Ayesha', 'Zainab', 'Dua', 'Hania', 'Maryam', 'Minahil', 'Anaya', 'Eshal', 'Sarah', 'Iman', 'Rania', 'Mahnoor', 'Zoya', 'Aliza', 'Kinza', 'Noor', 'Laiba', 'Areeba', 'Hareem'];
  const lastNames = ['Khan', 'Tariq', 'Siddiqui', 'Raza', 'Malik', 'Farooqi', 'Qureshi', 'Shah', 'Chaudhry', 'Bhatti', 'Rehman', 'Abbasi', 'Mirza', 'Baig', 'Hashmi', 'Gillani', 'Akram', 'Ghani', 'Naveed', 'Sheikh'];

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'O+', 'O-'];
  const sectors = ['Sector F-10/2', 'Sector G-9/1', 'Sector I-8/4', 'Sector F-7/3', 'Sector E-11/3', 'DHA Phase 2', 'Bahria Town Phase 4', 'Sector H-13'];

  const students: Student[] = [];
  let studentCounter = 1;

  INITIAL_CLASSES.forEach((cls) => {
    cls.sections.forEach((sec) => {
      // 6 students per section = 60 total
      for (let i = 1; i <= 6; i++) {
        const isBoy = (studentCounter % 2) === 1;
        const firstArr = isBoy ? firstNamesBoys : firstNamesGirls;
        const firstName = firstArr[(studentCounter * 7) % firstArr.length];
        const lastName = lastNames[(studentCounter * 11) % lastNames.length];
        const fullName = `${firstName} ${lastName}`;
        const rollNumber = `${cls.numericGrade}${sec.name.replace('Section ', '')}-${String(i).padStart(2, '0')}`;
        const admissionNumber = `AHA-2024-${String(studentCounter).padStart(3, '0')}`;

        // Pakistani mobile: +92 300 000xxxx
        const phoneSuffix = 2000000 + studentCounter * 1234;
        const phone = `+92 300 ${String(phoneSuffix).slice(0, 7)}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${studentCounter}@gmail.com`;

        const guardianFirstName = firstNamesBoys[(studentCounter * 3) % firstNamesBoys.length];
        const guardianName = `${guardianFirstName} ${lastName}`;
        const guardianPhone = `+92 321 ${String(4000000 + studentCounter * 4321).slice(0, 7)}`;

        const birthYear = 2026 - cls.numericGrade - 5; // e.g. Grade 10 -> 2011 (age 15)
        const birthMonth = String((studentCounter % 12) + 1).padStart(2, '0');
        const birthDay = String((studentCounter % 27) + 1).padStart(2, '0');

        const routeId = studentCounter % 3 === 0 ? 'rt-01' : studentCounter % 3 === 1 ? 'rt-02' : undefined;
        const stopId = routeId === 'rt-01' ? 'stp-101' : routeId === 'rt-02' ? 'stp-202' : undefined;

        students.push({
          id: `stu-${String(studentCounter).padStart(3, '0')}`,
          email,
          phone,
          role: 'STUDENT',
          fullName,
          mustChangePassword: studentCounter === 1 ? false : (studentCounter % 7 === 0), // stu-001 is main demo student!
          isActive: true,
          createdAt: '2024-08-10T09:00:00Z',
          lastLogin: studentCounter <= 10 ? '2026-10-26T14:32:00Z' : undefined,
          failedLoginAttempts: 0,
          lockedUntil: null,
          rollNumber,
          admissionNumber,
          classId: cls.id,
          sectionId: sec.id,
          dateOfBirth: `${birthYear}-${birthMonth}-${birthDay}`,
          gender: isBoy ? 'MALE' : 'FEMALE',
          guardianName,
          guardianPhone,
          guardianRelation: 'Father',
          address: `House ${studentCounter * 3}, Street 14, ${sectors[studentCounter % sectors.length]}, Islamabad`,
          bloodGroup: bloodGroups[studentCounter % bloodGroups.length],
          transportRouteId: routeId,
          transportStopId: stopId,
          enrollmentDate: '2024-08-15',
          status: 'ACTIVE',
          documents: [
            {
              id: `doc-${studentCounter}-1`,
              title: 'NADRA Birth Certificate / B-Form',
              fileName: `bform_${admissionNumber.toLowerCase()}.pdf`,
              fileSize: '1.4 MB',
              fileType: 'application/pdf',
              uploadDate: '2024-08-15',
            },
            {
              id: `doc-${studentCounter}-2`,
              title: 'Previous School Leaving Certificate',
              fileName: `slc_${admissionNumber.toLowerCase()}.pdf`,
              fileSize: '840 KB',
              fileType: 'application/pdf',
              uploadDate: '2024-08-16',
            },
          ],
        });

        studentCounter++;
      }
    });
  });

  return students;
}

// Generate 3 months of attendance (Aug, Sep, Oct 2026) for students
export function generateSeedAttendance(students: Student[]): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  // Sample dates across past 30 school days
  const sampleDates = [
    '2026-10-26', '2026-10-25', '2026-10-24', '2026-10-23', '2026-10-22',
    '2026-10-19', '2026-10-18', '2026-10-17', '2026-10-16', '2026-10-15',
    '2026-10-12', '2026-10-11', '2026-10-10', '2026-10-09', '2026-10-08',
    '2026-10-05', '2026-10-04', '2026-10-03', '2026-10-02', '2026-10-01',
    '2026-09-28', '2026-09-25', '2026-09-22', '2026-09-18', '2026-09-15',
    '2026-09-10', '2026-09-04', '2026-08-28', '2026-08-20', '2026-08-16',
  ];

  let recId = 1;
  students.forEach((stu, index) => {
    // stu-001 has high attendance (e.g. 96%)
    const isModelStudent = index === 0;
    const isDefaulter = index === 5 || index === 25; // 2 defaulters for demonstration

    sampleDates.forEach((date, dIndex) => {
      let status: 'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE' = 'PRESENT';

      if (isModelStudent) {
        if (dIndex === 14) status = 'LEAVE';
        else if (dIndex === 28) status = 'LATE';
        else status = 'PRESENT';
      } else if (isDefaulter) {
        if (dIndex % 3 === 0) status = 'ABSENT';
        else if (dIndex % 5 === 0) status = 'LEAVE';
        else status = 'PRESENT';
      } else {
        const hash = (index * 13 + dIndex * 7) % 100;
        if (hash < 82) status = 'PRESENT';
        else if (hash < 90) status = 'LATE';
        else if (hash < 96) status = 'LEAVE';
        else status = 'ABSENT';
      }

      records.push({
        id: `att-${recId++}`,
        studentId: stu.id,
        classId: stu.classId,
        sectionId: stu.sectionId,
        date,
        status,
        remarks: status === 'LEAVE' ? 'Medical application submitted' : status === 'LATE' ? 'Late bus arrival' : undefined,
        markedBy: 'admin-01',
        updatedAt: `${date}T08:45:00Z`,
      });
    });
  });

  return records;
}

// Generate Fee Vouchers
export function generateSeedFeeVouchers(students: Student[]): FeeVoucher[] {
  const vouchers: FeeVoucher[] = [];
  const months = ['2026-08', '2026-09', '2026-10'];

  let vNum = 1001;

  students.forEach((stu, idx) => {
    months.forEach((mStr) => {
      const isCurrentMonth = mStr === '2026-10';
      const isLastMonth = mStr === '2026-09';

      const tuitionFee = 18500;
      const labFee = stu.classId === 'cls-10' || stu.classId === 'cls-09' ? 2500 : 1500;
      const examFee = isCurrentMonth ? 3000 : 0;
      const transportFee = stu.transportRouteId ? 5500 : 0;

      const items: Array<{ title: string; amount: number; headType: FeeHeadType }> = [
        { title: 'Monthly Tuition Fee', amount: tuitionFee, headType: 'TUITION' },
        { title: 'Science & Computer Lab Fee', amount: labFee, headType: 'LAB' },
      ];

      if (examFee > 0) items.push({ title: 'Midterm Examination Fee', amount: examFee, headType: 'EXAMINATION' });
      if (transportFee > 0) items.push({ title: 'School Bus Transport', amount: transportFee, headType: 'TRANSPORT' });

      const subtotal = items.reduce((s, it) => s + it.amount, 0);
      const discount = idx === 0 ? 2000 : (idx % 8 === 0 ? 1500 : 0); // scholarship for top students
      const totalAmount = subtotal - discount;

      // Status variations
      let status: 'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE' = 'PAID';
      let paidAmount = totalAmount;
      let fine = 0;

      if (isCurrentMonth) {
        if (idx === 0) {
          // Model student: unpaid October voucher ready to pay in demo!
          status = 'UNPAID';
          paidAmount = 0;
        } else if (idx % 4 === 0) {
          status = 'UNPAID';
          paidAmount = 0;
        } else if (idx % 7 === 0) {
          status = 'PARTIAL';
          paidAmount = 10000;
        } else {
          status = 'PAID';
          paidAmount = totalAmount;
        }
      } else if (isLastMonth) {
        if (idx === 5 || idx === 18) {
          status = 'OVERDUE';
          paidAmount = 0;
          fine = 500;
        } else {
          status = 'PAID';
          paidAmount = totalAmount;
        }
      } else {
        // August
        status = 'PAID';
        paidAmount = totalAmount;
      }

      const issueDate = `${mStr}-01`;
      const dueDate = `${mStr}-15`;

      vouchers.push({
        id: `vch-${vNum}`,
        voucherNumber: `VCH-${mStr.replace('-', '')}-${String(vNum).slice(1)}`,
        studentId: stu.id,
        classId: stu.classId,
        sectionId: stu.sectionId,
        month: mStr,
        issueDate,
        dueDate,
        items,
        subtotal,
        discount,
        fine,
        totalAmount: totalAmount + fine,
        paidAmount,
        remainingAmount: Math.max(0, totalAmount + fine - paidAmount),
        status,
        paymentMethod: status === 'PAID' ? (idx % 2 === 0 ? 'ONLINE_CARD' : 'JAZZCASH') : undefined,
        paidAt: status === 'PAID' ? `${mStr}-10T11:20:00Z` : undefined,
        transactionRef: status === 'PAID' ? `TXN-AHA-${vNum}98` : undefined,
      });

      vNum++;
    });
  });

  return vouchers;
}

// Generate Exams & Results
export const INITIAL_EXAMS: Exam[] = [
  {
    id: 'exam-01',
    title: 'First Term Assessment 2026',
    academicSession: '2026-2027',
    startDate: '2026-09-15',
    endDate: '2026-09-26',
    isPublished: true,
    classIds: ['cls-06', 'cls-07', 'cls-08', 'cls-09', 'cls-10'],
  },
  {
    id: 'exam-02',
    title: 'Midterm Board Mock Examinations 2026',
    academicSession: '2026-2027',
    startDate: '2026-10-10',
    endDate: '2026-10-21',
    isPublished: true,
    classIds: ['cls-06', 'cls-07', 'cls-08', 'cls-09', 'cls-10'],
  },
];

export function generateSeedExamResults(students: Student[], exams: Exam[]): StudentExamResult[] {
  const results: StudentExamResult[] = [];
  let resCounter = 1;

  exams.forEach((exam) => {
    // Group students by class and section to compute ranks accurately
    const classGroups: Record<string, Student[]> = {};
    students.forEach((s) => {
      if (!classGroups[s.classId]) classGroups[s.classId] = [];
      classGroups[s.classId].push(s);
    });

    Object.entries(classGroups).forEach(([, classStudents]) => {
      // Find subjects for this class
      const classSubjects = INITIAL_SUBJECTS.filter((sub) => sub.classId === classStudents[0].classId);

      // Score each student
      const scoredList: Array<{ student: Student; marks: any[]; totalObt: number; totalMax: number }> = [];

      classStudents.forEach((stu, sIdx) => {
        const isTop = sIdx === 0 || stu.id === 'stu-001';
        let totalObt = 0;
        let totalMax = 0;

        const marks = classSubjects.map((sub, subIdx) => {
          const maxMarks = 100;
          let obt = 0;

          if (isTop) {
            obt = 88 + ((subIdx * 3) % 11); // 88 to 98
          } else {
            const base = 55 + ((sIdx * 17 + subIdx * 7) % 38);
            obt = Math.min(96, Math.max(48, base));
          }

          totalObt += obt;
          totalMax += maxMarks;

          let grade = 'B';
          if (obt >= 90) grade = 'A+';
          else if (obt >= 80) grade = 'A';
          else if (obt >= 70) grade = 'B';
          else if (obt >= 60) grade = 'C';
          else if (obt >= 50) grade = 'D';
          else grade = 'F';

          return {
            subjectId: sub.id,
            totalMarks: maxMarks,
            obtainedMarks: obt,
            passingMarks: 50,
            grade,
            remarks: obt >= 85 ? 'Commendable Mastery' : obt >= 65 ? 'Satisfactory Progress' : 'Requires Guidance',
          };
        });

        scoredList.push({ student: stu, marks, totalObt, totalMax });
      });

      // Sort by totalObt descending to assign rank
      scoredList.sort((a, b) => b.totalObt - a.totalObt);

      scoredList.forEach((item, rIdx) => {
        const percentage = Number(((item.totalObt / item.totalMax) * 100).toFixed(1));
        let grade = 'B';
        let gpa = 3.0;

        if (percentage >= 90) { grade = 'A+'; gpa = 4.0; }
        else if (percentage >= 80) { grade = 'A'; gpa = 3.7; }
        else if (percentage >= 70) { grade = 'B'; gpa = 3.0; }
        else if (percentage >= 60) { grade = 'C'; gpa = 2.0; }
        else if (percentage >= 50) { grade = 'D'; gpa = 1.0; }
        else { grade = 'F'; gpa = 0.0; }

        results.push({
          id: `res-${resCounter++}`,
          examId: exam.id,
          studentId: item.student.id,
          classId: item.student.classId,
          sectionId: item.student.sectionId,
          marks: item.marks,
          totalMaxMarks: item.totalMax,
          totalObtainedMarks: item.totalObt,
          percentage,
          grade,
          gpa,
          classRank: rIdx + 1,
          status: percentage >= 50 ? 'PASSED' : 'FAILED',
          teacherRemarks: rIdx < 3 ? 'Exemplary intellectual rigor and discipline.' : 'Consistent effort shown across academic assessments.',
          publishedAt: exam.endDate + 'T12:00:00Z',
        });
      });
    });
  });

  return results;
}

export const INITIAL_NOTICES: SchoolNotice[] = [
  {
    id: 'not-01',
    title: 'Midterm Examinations 2026 Official Date Sheet & Instructions',
    content: 'All students and faculty members are informed that Midterm Examinations will commence from the scheduled dates. Morning sessions begin strictly at 08:30 AM. Clear transparent pencil cases and official student ID cards are mandatory in the examination hall.',
    target: 'ALL',
    priority: 'HIGH',
    isPinned: true,
    publishDate: '2026-10-18',
    authorName: 'Academic Directorate',
  },
  {
    id: 'not-02',
    title: 'Annual Science Olympiad & Robotics Exhibition Registration',
    content: 'Registration is now open for the 7th Aurelian Science & Robotics Exhibition. Categories include AI & Automation, Green Energy Prototypes, and Mathematical Modelling. Interested teams should submit their project abstracts by Friday.',
    target: 'ALL',
    priority: 'MEDIUM',
    isPinned: true,
    publishDate: '2026-10-22',
    authorName: 'STEM Faculty Council',
  },
  {
    id: 'not-03',
    title: 'Class 10 Advanced Physics Practical Lab Schedule',
    content: 'Section A & B students of Class 10 must complete their optical bench and projectile trajectory practical logbooks before Thursday.',
    target: 'CLASS',
    targetClassId: 'cls-10',
    priority: 'HIGH',
    isPinned: false,
    publishDate: '2026-10-24',
    authorName: 'Dr. Shahida Parveen',
  },
  {
    id: 'not-04',
    title: 'Winter Uniform Transition Period Notice',
    content: 'Commencing Monday, students are permitted to transition into the official navy blue blazer and school cardigan. Standard institutional dress codes remain strictly enforced.',
    target: 'ALL',
    priority: 'LOW',
    isPinned: false,
    publishDate: '2026-10-25',
    authorName: 'Dean of Students',
  },
];

export const INITIAL_EVENTS: SchoolEvent[] = [
  {
    id: 'ev-01',
    title: 'All-Pakistan Inter-School Debate Championship',
    description: 'Parliamentary style debate in English & Urdu hosted at the Jinnah Memorial Auditorium.',
    type: 'ACADEMIC',
    startDate: '2026-11-04',
    endDate: '2026-11-06',
    venue: 'Main Auditorium',
    allDay: true,
  },
  {
    id: 'ev-02',
    title: 'Annual Parent-Teacher Conference (PTM Term 1)',
    description: 'One-on-one evaluations with class and subject teachers regarding progress and midterm results.',
    type: 'PTM',
    startDate: '2026-11-14',
    endDate: '2026-11-14',
    venue: 'Campus Classrooms & Main Courtyard',
    allDay: false,
  },
  {
    id: 'ev-03',
    title: 'Iqbal Day Commemoration & Poetry Recital',
    description: 'Institutional celebration of the philosophy of Allama Iqbal with declamation contests.',
    type: 'CULTURAL',
    startDate: '2026-11-09',
    endDate: '2026-11-09',
    venue: 'Amphitheatre',
    allDay: true,
  },
  {
    id: 'ev-04',
    title: 'Annual Sports Gala 2026',
    description: 'Track and field athletics, cricket finals, football tournament, and tug-of-war.',
    type: 'SPORTS',
    startDate: '2026-11-20',
    endDate: '2026-11-22',
    venue: 'Sports Complex & Athletics Track',
    allDay: true,
  },
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-01',
    title: 'Quadratic Equations & Optimization Problems',
    description: 'Solve exercises 4.1 to 4.3 from textbook. Show all derivation steps for the quadratic roots and vertex calculations.',
    classId: 'cls-10',
    subjectId: 'sub-10-math',
    assignedBy: 'tch-01',
    dueDate: '2026-10-30',
    maxScore: 25,
    createdAt: '2026-10-24',
  },
  {
    id: 'asg-02',
    title: 'Electromagnetic Induction Lab Analysis',
    description: 'Write an experimental review on Faraday’s Law and Lenz’s Law with labeled schematic diagrams of magnetic flux.',
    classId: 'cls-10',
    subjectId: 'sub-10-phy',
    assignedBy: 'tch-02',
    dueDate: '2026-11-02',
    maxScore: 30,
    createdAt: '2026-10-25',
  },
  {
    id: 'asg-03',
    title: 'Critical Essay on Shakespearean Tragic Flaw',
    description: 'Compose a 1200-word analytical essay discussing the hubris in Macbeth Act III.',
    classId: 'cls-10',
    subjectId: 'sub-10-eng',
    assignedBy: 'tch-04',
    dueDate: '2026-11-05',
    maxScore: 20,
    createdAt: '2026-10-26',
  },
  {
    id: 'asg-04',
    title: 'Python Binary Search & Complexity Lab',
    description: 'Implement iterative and recursive binary search in Python with big-O notation complexity graphs.',
    classId: 'cls-10',
    subjectId: 'sub-10-cs',
    assignedBy: 'tch-03',
    dueDate: '2026-10-29',
    maxScore: 20,
    createdAt: '2026-10-23',
  },
];

export const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'subm-01',
    assignmentId: 'asg-04',
    studentId: 'stu-001',
    submissionDate: '2026-10-26T10:15:00Z',
    content: 'Attached Python script with recursive and iterative implementations along with benchmark timings.',
    fileName: 'binary_search_stu001.py',
    score: 19,
    feedback: 'Excellent code hygiene, robust edge case handling, and well-documented docstrings.',
    status: 'GRADED',
  },
  {
    id: 'subm-02',
    assignmentId: 'asg-01',
    studentId: 'stu-001',
    submissionDate: '2026-10-26T16:40:00Z',
    content: 'Solutions to all 12 exercises with handwritten derivation scans attached.',
    fileName: 'math_exercises_ch4.pdf',
    status: 'SUBMITTED',
  },
];

export const INITIAL_LOANS: BookLoan[] = [
  {
    id: 'ln-01',
    bookId: 'bk-05',
    studentId: 'stu-001',
    issueDate: '2026-10-12',
    dueDate: '2026-10-28',
    fineAmount: 0,
    status: 'ISSUED',
  },
  {
    id: 'ln-02',
    bookId: 'bk-01',
    studentId: 'stu-001',
    issueDate: '2026-09-10',
    dueDate: '2026-09-24',
    returnDate: '2026-09-22',
    fineAmount: 0,
    status: 'RETURNED',
  },
];

export const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: 'lv-01',
    studentId: 'stu-001',
    startDate: '2026-10-15',
    endDate: '2026-10-15',
    reason: 'Family wedding event in Lahore requiring official leave.',
    status: 'APPROVED',
    adminRemarks: 'Approved with note to complete missed assignments.',
    submittedAt: '2026-10-13T10:00:00Z',
    reviewedAt: '2026-10-14T09:30:00Z',
    reviewedBy: 'admin-01',
  },
  {
    id: 'lv-02',
    studentId: 'stu-002',
    startDate: '2026-10-28',
    endDate: '2026-10-29',
    reason: 'Medical recovery for dental surgery.',
    status: 'PENDING',
    submittedAt: '2026-10-26T18:00:00Z',
  },
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt-01',
    studentId: 'stu-001',
    subject: 'Transportation Route Stop Adjustment Request',
    category: 'TRANSPORT',
    status: 'IN_PROGRESS',
    createdAt: '2026-10-20T11:00:00Z',
    messages: [
      {
        id: 'msg-01',
        senderId: 'stu-001',
        senderName: 'Muhammad Khan',
        senderRole: 'STUDENT',
        text: 'Assalam-o-Alaikum, due to road construction on Margalla road, can the morning bus stop 5 minutes closer to the main roundabout?',
        timestamp: '2026-10-20T11:00:00Z',
      },
      {
        id: 'msg-02',
        senderId: 'admin-01',
        senderName: 'Administrative Office',
        senderRole: 'ADMIN',
        text: 'Walaikum Assalam Muhammad. We have coordinated with Driver Sajjad. The route will incorporate the modified turnaround from Monday.',
        timestamp: '2026-10-21T09:15:00Z',
      },
    ],
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-01',
    userId: 'admin-01',
    userName: 'Principal / Senior Registrar',
    userRole: 'ADMIN',
    action: 'PUBLISH_EXAM_RESULTS',
    module: 'Examinations',
    details: 'Published official tabulated results for Midterm Board Mock Examinations 2026 across Classes 6 through 10.',
    timestamp: '2026-10-22T14:30:00Z',
  },
  {
    id: 'log-02',
    userId: 'admin-01',
    userName: 'Principal / Senior Registrar',
    userRole: 'ADMIN',
    action: 'GENERATE_MONTHLY_VOUCHERS',
    module: 'Fees & Finance',
    details: 'Generated 60 monthly vouchers for October 2026 with transport head and term examination surcharges.',
    timestamp: '2026-10-01T08:00:00Z',
  },
  {
    id: 'log-03',
    userId: 'admin-01',
    userName: 'Principal / Senior Registrar',
    userRole: 'ADMIN',
    action: 'APPROVE_LEAVE',
    module: 'Attendance',
    details: 'Approved 1-day family leave for student Muhammad Khan (stu-001).',
    timestamp: '2026-10-14T09:30:00Z',
  },
];
