/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Library, BookOpen, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getBookLoans, getLibraryBooks } from '../../services/api';
import { BookLoan, LibraryBook } from '../../types';
import { formatDate, formatPKR } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';

export const StudentLibrary: React.FC = () => {
  const { currentUser } = useAuth();
  const [loans, setLoans] = useState<BookLoan[]>([]);
  const [books, setBooks] = useState<LibraryBook[]>([]);

  useEffect(() => {
    if (currentUser) {
      Promise.all([
        getBookLoans(currentUser.id),
        getLibraryBooks(),
      ]).then(([l, b]) => {
        setLoans(l);
        setBooks(b);
      });
    }
  }, [currentUser]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
          My Borrowed Library Books
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Track circulation due dates, return slips, and outstanding overdue library fines.
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-[#0E152B] border-b border-neutral-200 dark:border-[#242E56] text-neutral-500 font-semibold select-none">
              <tr>
                <th className="py-3 px-4">Book Title & Author</th>
                <th className="py-3 px-4">Shelf Location</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date for Return</th>
                <th className="py-3 px-4">Circulation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
              {loans.map((ln) => {
                const book = books.find((b) => b.id === ln.bookId);

                return (
                  <tr key={ln.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1A2347]/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900 dark:text-white">{book?.title}</div>
                      <div className="text-[10px] text-neutral-400">By {book?.author}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-teal-400 font-semibold">{book?.shelfLocation}</td>
                    <td className="py-3 px-4 font-mono">{formatDate(ln.issueDate)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-500">{formatDate(ln.dueDate)}</td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
