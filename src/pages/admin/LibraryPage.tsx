/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Library as LibraryIcon,
  Plus,
  BookOpen,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  X,
} from 'lucide-react';
import {
  getLibraryBooks,
  getBookLoans,
  getStudents,
  createLibraryBook,
  issueBook,
  returnBook,
} from '../../services/api';
import { LibraryBook, BookLoan, Student } from '../../types';
import { formatDate, formatPKR } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const LibraryPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loans, setLoans] = useState<BookLoan[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'catalogue' | 'loans'>('catalogue');

  // Issue Book Modal
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [dueDate, setDueDate] = useState('2026-11-10');

  // Add Book Modal
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookIsbn, setBookIsbn] = useState('');
  const [bookCategory, setBookCategory] = useState('Science & STEM');
  const [bookCopies, setBookCopies] = useState(5);
  const [shelfLocation, setShelfLocation] = useState('Shelf SCI-04');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [b, l, s] = await Promise.all([getLibraryBooks(), getBookLoans(), getStudents()]);
    setBooks(b);
    setLoans(l);
    setStudents(s);
    if (b.length > 0) setSelectedBookId(b[0].id);
    if (s.length > 0) setSelectedStudentId(s[0].id);
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await issueBook(selectedBookId, selectedStudentId, dueDate, currentUser);
      showSuccess('Book Issued', 'Checkout registered with due date.');
      setIsIssueModalOpen(false);
      loadData();
    } catch (err: any) {
      showError('Issue Error', err.message);
    }
  };

  const handleReturnLoan = async (loanId: string) => {
    if (!currentUser) return;
    try {
      await returnBook(loanId, 0, currentUser);
      showSuccess('Book Returned', 'Stock inventory restored to catalogue.');
      loadData();
    } catch (err: any) {
      showError('Return Error', err.message);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    try {
      await createLibraryBook(
        {
          title: bookTitle,
          author: bookAuthor,
          isbn: bookIsbn,
          category: bookCategory,
          totalCopies: Number(bookCopies),
          availableCopies: Number(bookCopies),
          shelfLocation,
        },
        currentUser
      );
      showSuccess('Book Added', `Added "${bookTitle}" to school library.`);
      setIsAddBookModalOpen(false);
      setBookTitle('');
      setBookAuthor('');
      loadData();
    } catch (err: any) {
      showError('Error', err.message);
    }
  };

  const filteredBooks = books.filter((b) => {
    const q = searchQuery.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.isbn.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            Library & Learning Resource Centre
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Institutional book catalogue, circulation management, checkouts, and stock availability.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
          >
            <BookOpen className="w-4 h-4" />
            <span>Issue Book</span>
          </button>
          <button
            onClick={() => setIsAddBookModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-sm transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add to Catalogue</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-200 dark:border-[#242E56] pb-3">
        <div className="flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('catalogue')}
            className={`py-1.5 border-b-2 transition-colors ${
              activeTab === 'catalogue'
                ? 'border-indigo-600 text-indigo-600 dark:text-teal-400 dark:border-teal-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Catalogue ({books.length} Titles)
          </button>
          <button
            onClick={() => setActiveTab('loans')}
            className={`py-1.5 border-b-2 transition-colors ${
              activeTab === 'loans'
                ? 'border-indigo-600 text-indigo-600 dark:text-teal-400 dark:border-teal-400'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            Circulation & Checkouts ({loans.length})
          </button>
        </div>

        {activeTab === 'catalogue' && (
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search title, author, or ISBN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-neutral-200 dark:border-[#242E56] bg-white dark:bg-[#0B1020] text-neutral-900 dark:text-white focus:outline-none"
            />
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        )}
      </div>

      {/* CATALOGUE TAB */}
      {activeTab === 'catalogue' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#1A2347] pb-2.5">
                  <span className="font-mono text-[10px] text-neutral-400">{b.isbn}</span>
                  <span className="text-[11px] font-semibold text-teal-600 dark:text-teal-400">
                    {b.shelfLocation}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-white font-['Sora'] leading-tight">
                    {b.title}
                  </h3>
                  <div className="text-xs text-neutral-500">By {b.author}</div>
                  <div className="text-[11px] text-neutral-400">{b.category}</div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 dark:border-[#1A2347] flex items-center justify-between text-xs">
                <span className="font-mono">
                  Available: <strong className={b.availableCopies > 0 ? 'text-emerald-500' : 'text-rose-500'}>{b.availableCopies}</strong> / {b.totalCopies}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    b.availableCopies > 0
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {b.availableCopies > 0 ? 'In Stock' : 'Checked Out'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOANS TAB */}
      {activeTab === 'loans' && (
        <div className="rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-[#0E152B] border-b border-neutral-200 dark:border-[#242E56] text-neutral-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">Book Title</th>
                  <th className="py-3 px-4">Borrowing Student</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
                {loans.map((ln) => {
                  const bk = books.find((b) => b.id === ln.bookId);
                  const stu = students.find((s) => s.id === ln.studentId);

                  return (
                    <tr key={ln.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1A2347]/50">
                      <td className="py-3 px-4 font-semibold text-neutral-900 dark:text-white">
                        {bk?.title || 'Library Title'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-neutral-900 dark:text-white">{stu?.fullName || 'Student'}</div>
                        <div className="text-[10px] font-mono text-neutral-400">{stu?.rollNumber}</div>
                      </td>
                      <td className="py-3 px-4 font-mono">{formatDate(ln.issueDate)}</td>
                      <td className="py-3 px-4 font-mono">{formatDate(ln.dueDate)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            ln.status === 'ISSUED'
                              ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                              : ln.status === 'RETURNED'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                        >
                          {ln.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {ln.status === 'ISSUED' && (
                          <button
                            onClick={() => handleReturnLoan(ln.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 ml-auto"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Return</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ISSUE BOOK MODAL */}
      {isIssueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">Issue Library Book</h3>
            <form onSubmit={handleIssueSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Select Book</label>
                <select
                  value={selectedBookId}
                  onChange={(e) => setSelectedBookId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                >
                  {books.filter((b) => b.availableCopies > 0).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.title} ({b.availableCopies} available)
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Student Borrower</label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.rollNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Due Date for Return</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white"
                >
                  Confirm Issue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD BOOK MODAL */}
      {isAddBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">Add to Library Catalogue</h3>
            <form onSubmit={handleAddBook} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Book Title</label>
                <input
                  type="text"
                  required
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  placeholder="e.g. A Brief History of Time"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Author Name</label>
                <input
                  type="text"
                  required
                  value={bookAuthor}
                  onChange={(e) => setBookAuthor(e.target.value)}
                  placeholder="e.g. Stephen Hawking"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">ISBN Number</label>
                  <input
                    type="text"
                    required
                    value={bookIsbn}
                    onChange={(e) => setBookIsbn(e.target.value)}
                    placeholder="978-0553380163"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Total Copies</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={bookCopies}
                    onChange={(e) => setBookCopies(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Shelf Location Code</label>
                <input
                  type="text"
                  required
                  value={shelfLocation}
                  onChange={(e) => setShelfLocation(e.target.value)}
                  placeholder="Shelf SCI-04"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddBookModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                >
                  Save Title
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
