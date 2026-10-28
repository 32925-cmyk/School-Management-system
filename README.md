# Aurelian Heights Academy - School Management System
> *"Where Tomorrow Learns Today"*

A production-grade, full-stack School Management System (SMS) engineered with React, TypeScript, Tailwind CSS, Recharts, and a clean decoupled service architecture.

---

## 1. Credentials

The application is pre-seeded with realistic institutional records (60 students across Class 6–10, 12 faculty members, 3 months of attendance registers, fee vouchers with Pakistani currency formatting, and board examination results).

| Role | Identifier (Email or Mobile) | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Administrator (Owner)** | `saqibsb13b@gmail.com` *(or `03482802484`)* | `@Saqibsb13b` | Primary Institutional Admin Account (Full Privileges) |
| **Administrator (System)** | `admin@aurelianheights.edu` | `Admin@12345` | Fallback System Superadmin |
| **Student** | `muhammad.khan1@gmail.com` *(or `03002001234`)* | `Student@12345` | Model student (Muhammad Khan, Class 10A, Roll 10A-01) with pending fee voucher & results |

*Note: You can click the "Pre-Seeded Demo Credentials" button on the login screen to automatically populate and test either account.*

### Instant Source Code ZIP
- Direct Download in running app: Click the **"Download .ZIP"** button in the TopBar, the Settings Page, or visit `/aurelian-heights-academy.zip`.
- Or use the API endpoint: `/api/download-zip`

### Deployment & Local Run
```bash
# 1. Install dependencies
npm install

# 2. Build client bundle
npm run build

# 3. Start full-stack server with database persistence
npm start
```

---

## 2. Architecture & Service Layer Decoupling

Storage and database operations are strictly separated from UI components:

```
src/
├── types/index.ts            # Canonical domain entity interfaces
├── services/
│   ├── api.ts                # THE PUBLIC CONTRACT - all UI components call ONLY this module
│   ├── localDb.ts            # Current storage provider (localStorage + in-memory seed)
│   ├── firebaseDb.ts         # Ready-to-implement Firestore adapter stub
│   └── seedData.ts           # Realistic seed dataset
```

To replace the `localStorage` implementation with Firebase Firestore or Supabase PostgreSQL, **you only need to modify `src/services/api.ts`** by redirecting its imports to your database driver. No UI components or hooks will need to change.

---

## 3. Database Schema Specification

### Collections / Tables & Fields

#### `users` / `students`
- `id`: string (e.g. `stu-001`, `admin-01`)
- `email`: string (unique, indexed)
- `phone`: string (Pakistani mobile format `+92 3xx xxxxxxx`, unique, indexed)
- `role`: `'ADMIN' | 'STUDENT' | 'TEACHER' | 'PARENT'`
- `fullName`: string
- `admissionNumber`: string (unique, e.g. `AHA-2024-001`)
- `rollNumber`: string (e.g. `10A-01`)
- `classId`: string (foreign key to `classes.id`)
- `sectionId`: string (foreign key to `classes.sections.id`)
- `dateOfBirth`: string (ISO date `YYYY-MM-DD`)
- `gender`: `'MALE' | 'FEMALE'`
- `guardianName`: string
- `guardianPhone`: string
- `address`: string
- `bloodGroup`: string (e.g. `B+`, `A+`)
- `transportRouteId`: string (optional, foreign key to `routes.id`)
- `transportStopId`: string (optional)
- `status`: `'ACTIVE' | 'INACTIVE' | 'ALUMNI' | 'SUSPENDED'`
- `mustChangePassword`: boolean
- `failedLoginAttempts`: number
- `lockedUntil`: timestamp / null

#### `classes`
- `id`: string (e.g. `cls-10`)
- `name`: string (e.g. `Class 10`)
- `numericGrade`: number (e.g. `10`)
- `sections`: array of objects:
  - `id`: string (e.g. `sec-10-a`)
  - `name`: string (e.g. `Section A`)
  - `classId`: string
  - `capacity`: number
  - `roomNumber`: string
  - `classTeacherId`: string (foreign key to `teachers.id`)

#### `teachers`
- `id`: string (e.g. `tch-01`)
- `fullName`: string (e.g. `Prof. Tariq Mansoor`)
- `email`: string
- `phone`: string
- `qualification`: string (e.g. `Ph.D. Mathematics, QAU`)
- `specialization`: string
- `designation`: string
- `joiningDate`: string
- `status`: `'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'`

#### `attendance`
- `id`: string
- `studentId`: string (foreign key to `students.id`)
- `classId`: string
- `sectionId`: string
- `date`: string (ISO date `YYYY-MM-DD`)
- `status`: `'PRESENT' | 'ABSENT' | 'LATE' | 'LEAVE'`
- `remarks`: string (optional)
- `markedBy`: string (user id)
- `updatedAt`: timestamp

#### `vouchers` (Fee Vouchers)
- `id`: string (e.g. `vch-1001`)
- `voucherNumber`: string (e.g. `VCH-202610-1001`)
- `studentId`: string (foreign key)
- `classId`: string
- `sectionId`: string
- `month`: string (e.g. `2026-10`)
- `issueDate`: string
- `dueDate`: string
- `items`: array of `{ title: string, amount: number, headType: string }`
- `subtotal`: number
- `discount`: number
- `fine`: number
- `totalAmount`: number
- `paidAmount`: number
- `remainingAmount`: number
- `status`: `'PAID' | 'PARTIAL' | 'UNPAID' | 'OVERDUE'`
- `paymentMethod`: string (optional)
- `paidAt`: timestamp (optional)
- `transactionRef`: string (optional)

#### `transactions` (Payment Ledger)
- `id`: string
- `voucherId`: string (foreign key)
- `studentId`: string (foreign key)
- `amount`: number
- `paymentMethod`: `'ONLINE_CARD' | 'JAZZCASH' | 'EASYPAISA' | 'BANK_TRANSFER' | 'CASH'`
- `transactionRef`: string
- `timestamp`: timestamp
- `receiptNumber`: string (e.g. `RCPT-2026-88190`)
- `receivedBy`: string

#### `exams` & `results`
- `exams`: `id`, `title`, `academicSession`, `startDate`, `endDate`, `isPublished`, `classIds`
- `results`: `id`, `examId`, `studentId`, `classId`, `sectionId`, `marks` array, `totalMaxMarks`, `totalObtainedMarks`, `percentage`, `grade`, `gpa`, `classRank`, `status`, `teacherRemarks`

#### `library_books` & `book_loans`
- `library_books`: `id`, `isbn`, `title`, `author`, `category`, `totalCopies`, `availableCopies`, `shelfLocation`
- `book_loans`: `id`, `bookId`, `studentId`, `issueDate`, `dueDate`, `returnDate`, `fineAmount`, `status`

#### `transport_routes`
- `id`, `routeName`, `routeCode`, `vehicleNumber`, `driverName`, `driverPhone`, `monthlyFee`, `stops` array

#### `leaves`
- `id`, `studentId`, `startDate`, `endDate`, `reason`, `status`, `adminRemarks`, `submittedAt`

#### `audit_logs`
- `id`, `userId`, `userName`, `userRole`, `action`, `module`, `details`, `timestamp`

---

## 4. Firestore Security Rules

When connecting Firebase Firestore, deploy these security rules in `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // User & Student Profiles
    match /users/{userId} {
      allow read: if isAuthenticated() && (isAdmin() || isOwner(userId));
      allow write: if isAdmin();
    }

    // Academic Classes & Sections
    match /classes/{classId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Attendance
    match /attendance/{attId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Fee Vouchers & Payment Transactions
    match /vouchers/{voucherId} {
      allow read: if isAuthenticated() && 
        (isAdmin() || resource.data.studentId == request.auth.uid);
      allow write: if isAdmin() || 
        (isAuthenticated() && request.resource.data.studentId == request.auth.uid && request.resource.data.status in ['PAID', 'PARTIAL']);
    }
    
    match /transactions/{txnId} {
      allow read: if isAuthenticated() && 
        (isAdmin() || resource.data.studentId == request.auth.uid);
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin();
    }

    // Exams & Results
    match /exams/{examId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    match /results/{resultId} {
      allow read: if isAuthenticated() && 
        (isAdmin() || (resource.data.studentId == request.auth.uid && get(/databases/$(database)/documents/exams/$(resource.data.examId)).data.isPublished == true));
      allow write: if isAdmin();
    }

    // Notices & Calendar Events
    match /notices/{noticeId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    match /events/{eventId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Library & Transport
    match /library_books/{bookId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
    match /book_loans/{loanId} {
      allow read: if isAuthenticated() && (isAdmin() || resource.data.studentId == request.auth.uid);
      allow write: if isAdmin();
    }
    match /transport_routes/{routeId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Leave Requests
    match /leaves/{leaveId} {
      allow read: if isAuthenticated() && (isAdmin() || resource.data.studentId == request.auth.uid);
      allow create: if isAuthenticated() && request.resource.data.studentId == request.auth.uid;
      allow update, delete: if isAdmin();
    }

    // Support Tickets
    match /tickets/{ticketId} {
      allow read, write: if isAuthenticated() && (isAdmin() || resource.data.studentId == request.auth.uid);
    }

    // Audit Logs
    match /audit_logs/{logId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
      allow update, delete: if false; // Append-only audit integrity
    }
  }
}
```

---

## 5. Supabase / PostgreSQL Row Level Security (RLS) Policies

If using PostgreSQL with Supabase:

```sql
-- Enable RLS on core tables
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

-- Admin full access policy
CREATE POLICY "Admins have full access" ON students
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'ADMIN');

-- Student self read policy
CREATE POLICY "Students view own profile" ON students
  FOR SELECT
  USING (auth.uid()::text = id);

-- Student view own fee vouchers
CREATE POLICY "Students view own vouchers" ON vouchers
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'ADMIN' OR auth.uid()::text = student_id);

-- Student view only published exam results
CREATE POLICY "Students view published results" ON results
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'ADMIN' OR 
    (auth.uid()::text = student_id AND EXISTS (
      SELECT 1 FROM exams WHERE exams.id = results.exam_id AND exams.is_published = true
    ))
  );
```

---

## 6. How to Connect a Real Backend (Step-by-Step)

### Step 1: Install Firebase / Supabase Client SDK
```bash
npm install firebase
# or for Supabase:
npm install @supabase/supabase-js
```

### Step 2: Configure Environment Variables
In your `.env` file (see `.env.example`):
```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="aurelian-heights.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="aurelian-heights"
VITE_FIREBASE_STORAGE_BUCKET="aurelian-heights.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789"
VITE_FIREBASE_APP_ID="1:123456789:web:abcdef"
```

### Step 3: Implement `src/services/firebaseDb.ts`
Uncomment the Firebase initialization in `src/services/firebaseDb.ts` and implement the query functions matching the existing `localDb.ts` signatures.

### Step 4: Switch Import in `src/services/api.ts`
Open `src/services/api.ts` and change the storage layer imports:
```typescript
// Replace:
import { getDatabase, saveDatabase, ... } from './localDb';

// With:
import { firestoreService, ... } from './firebaseDb';
```

Every single screen, report card generator, payment receipt, and filter in the entire web app will immediately run against your live cloud database!
