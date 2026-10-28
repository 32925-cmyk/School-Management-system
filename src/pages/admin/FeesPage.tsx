/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Receipt,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Printer,
  X,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import {
  getFeeVouchers,
  getStudents,
  getClasses,
  generateMonthlyVouchers,
  recordFeePayment,
} from '../../services/api';
import { FeeVoucher, Student, SchoolClass, PaymentTransaction } from '../../types';
import { formatPKR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Logo } from '../../components/common/Logo';

export const FeesPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [vouchers, setVouchers] = useState<FeeVoucher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [genMonth, setGenMonth] = useState('2026-11');
  const [genDueDate, setGenDueDate] = useState('2026-11-15');
  const [isGenerating, setIsGenerating] = useState(false);

  const [selectedVoucherForPayment, setSelectedVoucherForPayment] = useState<FeeVoucher | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BANK_TRANSFER' | 'JAZZCASH' | 'EASYPAISA' | 'ONLINE_CARD'>('CASH');
  const [paymentNotes, setPaymentNotes] = useState('');

  const [printableReceipt, setPrintableReceipt] = useState<{ voucher: FeeVoucher; student: Student } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vch, stu, cls] = await Promise.all([
        getFeeVouchers(),
        getStudents(),
        getClasses(),
      ]);
      setVouchers(vch);
      setStudents(stu);
      setClasses(cls);
    } catch (err: any) {
      showError('Failed to load fees', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsGenerating(true);
    try {
      const res = await generateMonthlyVouchers(genMonth, genDueDate, currentUser);
      showSuccess('Vouchers Generated', `Issued ${res.count} student vouchers for ${genMonth}.`);
      setIsGenerateModalOpen(false);
      loadData();
    } catch (err: any) {
      showError('Generation Error', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVoucherForPayment || !currentUser) return;
    try {
      await recordFeePayment(
        selectedVoucherForPayment.id,
        Number(paymentAmount),
        paymentMethod,
        paymentNotes,
        currentUser
      );

      const stu = students.find((s) => s.id === selectedVoucherForPayment.studentId);
      showSuccess(
        'Payment Recorded',
        `Received PKR ${paymentAmount.toLocaleString()} for voucher ${selectedVoucherForPayment.voucherNumber}.`
      );

      // Trigger printable receipt
      if (stu) {
        setPrintableReceipt({
          voucher: {
            ...selectedVoucherForPayment,
            paidAmount: selectedVoucherForPayment.paidAmount + paymentAmount,
            remainingAmount: Math.max(0, selectedVoucherForPayment.remainingAmount - paymentAmount),
            status: selectedVoucherForPayment.remainingAmount - paymentAmount <= 0 ? 'PAID' : 'PARTIAL',
          },
          student: stu,
        });
      }

      setSelectedVoucherForPayment(null);
      loadData();
    } catch (err: any) {
      showError('Payment Error', err.message);
    }
  };

  // Filtered vouchers
  const filteredVouchers = vouchers.filter((v) => {
    const matchesMonth = selectedMonth === 'ALL' || v.month === selectedMonth;
    const matchesStatus = selectedStatus === 'ALL' || v.status === selectedStatus;
    const stu = students.find((s) => s.id === v.studentId);
    const q = searchQuery.toLowerCase();
    const matchesQuery =
      !q ||
      v.voucherNumber.toLowerCase().includes(q) ||
      (stu && stu.fullName.toLowerCase().includes(q)) ||
      (stu && stu.rollNumber.toLowerCase().includes(q));

    return matchesMonth && matchesStatus && matchesQuery;
  });

  // Aggregate stats
  const totalInvoiced = filteredVouchers.reduce((s, v) => s + v.totalAmount, 0);
  const totalCollected = filteredVouchers.reduce((s, v) => s + v.paidAmount, 0);
  const totalOutstanding = filteredVouchers.reduce((s, v) => s + v.remainingAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
            Fee & Finance Management
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Automated billing structures, Pakistani payment reconciliations, and instant PDF receipts.
          </p>
        </div>

        <button
          onClick={() => setIsGenerateModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-2 shadow-sm transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Generate Batch Vouchers</span>
        </button>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs">
          <span className="text-xs font-semibold text-neutral-400">Total Billed In Scope</span>
          <div className="text-2xl font-bold font-mono-numbers text-neutral-900 dark:text-white mt-2">
            {formatPKR(totalInvoiced)}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">{filteredVouchers.length} vouchers calculated</div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs">
          <span className="text-xs font-semibold text-emerald-500">Total Realized & Cleared</span>
          <div className="text-2xl font-bold font-mono-numbers text-emerald-600 dark:text-emerald-400 mt-2">
            {formatPKR(totalCollected)}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">
            {Math.round((totalCollected / (totalInvoiced || 1)) * 100)}% realization rate
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs">
          <span className="text-xs font-semibold text-amber-500">Uncollected Balance</span>
          <div className="text-2xl font-bold font-mono-numbers text-amber-600 dark:text-amber-400 mt-2">
            {formatPKR(totalOutstanding)}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 mt-1">Pending student clearance</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by student name, roll no, voucher #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020] text-neutral-900 dark:text-white focus:outline-none"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Month Filter */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-[#242E56] bg-white dark:bg-[#0B1020] text-neutral-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Billing Months</option>
            <option value="2026-10">October 2026</option>
            <option value="2026-09">September 2026</option>
            <option value="2026-08">August 2026</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-[#242E56] bg-white dark:bg-[#0B1020] text-neutral-900 dark:text-white focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PARTIAL">Partial</option>
            <option value="UNPAID">Unpaid</option>
            <option value="OVERDUE">Overdue</option>
          </select>
        </div>
      </div>

      {/* Vouchers Table */}
      <div className="rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-[#0E152B] border-b border-neutral-200 dark:border-[#242E56] text-neutral-500 font-semibold select-none">
              <tr>
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Student & Roll</th>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4">Gross Total</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Remaining</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
              {filteredVouchers.map((vch) => {
                const stu = students.find((s) => s.id === vch.studentId);

                return (
                  <tr key={vch.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1A2347]/50">
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-teal-400">
                      {vch.voucherNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900 dark:text-white">
                        {stu?.fullName || 'Student'}
                      </div>
                      <div className="text-[10px] text-neutral-400 font-mono">
                        {stu?.rollNumber} · {vch.classId}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{vch.month}</td>
                    <td className="py-3 px-4 font-mono font-semibold">{formatPKR(vch.totalAmount)}</td>
                    <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400">{formatPKR(vch.paidAmount)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">{formatPKR(vch.remainingAmount)}</td>
                    <td className="py-3 px-4 font-mono">{formatDate(vch.dueDate)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          vch.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : vch.status === 'OVERDUE'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            : vch.status === 'PARTIAL'
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {vch.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {vch.remainingAmount > 0 && (
                          <button
                            onClick={() => {
                              setSelectedVoucherForPayment(vch);
                              setPaymentAmount(vch.remainingAmount);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
                          >
                            Record Pay
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (stu) setPrintableReceipt({ voucher: vch, student: stu });
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1A2347]"
                          title="Print Receipt Voucher"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {selectedVoucherForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">
              Record Fee Payment
            </h3>
            <p className="text-xs text-neutral-500">
              Voucher #{selectedVoucherForPayment.voucherNumber} · Total Dues: {formatPKR(selectedVoucherForPayment.remainingAmount)}
            </p>
            <form onSubmit={handleRecordPaymentSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Payment Amount (PKR)</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={selectedVoucherForPayment.remainingAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Payment Channel</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                >
                  <option value="CASH">Institutional Cash Counter</option>
                  <option value="BANK_TRANSFER">Bank Direct Transfer / 1Link</option>
                  <option value="JAZZCASH">JazzCash Merchant Gateway</option>
                  <option value="EASYPAISA">Easypaisa Mobile Wallet</option>
                  <option value="ONLINE_CARD">Debit / Credit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Receipt Notes / Bank Reference</label>
                <input
                  type="text"
                  placeholder="e.g. Deposit Slip #781923 at HBL Diplomatic Enclave"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedVoucherForPayment(null)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  Confirm & Clear Dues
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK GENERATE MODAL */}
      {isGenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <h3 className="font-bold text-base font-['Sora']">
              Issue Monthly Fee Vouchers
            </h3>
            <p className="text-xs text-neutral-500">
              Automatically calculate tuition, science/computer labs, transport, and overdue library fines for all 60 enrolled students.
            </p>
            <form onSubmit={handleBulkGenerate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1">Billing Month</label>
                <input
                  type="month"
                  required
                  value={genMonth}
                  onChange={(e) => setGenMonth(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Payment Due Date</label>
                <input
                  type="date"
                  required
                  value={genDueDate}
                  onChange={(e) => setGenDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsGenerateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Issue Vouchers in Bulk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {printableReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white border border-neutral-200 rounded-2xl shadow-2xl p-6 text-neutral-900 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between no-print border-b pb-3">
              <span className="font-bold text-sm font-['Sora']">Printable Official Voucher & Receipt</span>
              <button onClick={() => setPrintableReceipt(null)} className="text-neutral-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="p-6 border border-neutral-300 rounded-xl space-y-4 print-break-inside-avoid text-xs">
              {/* Header */}
              <div className="flex items-start justify-between border-b pb-4">
                <Logo size="sidebar" variant="full" isDark={false} />
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-indigo-700">
                    {printableReceipt.voucher.voucherNumber}
                  </div>
                  <div className="text-[11px] text-neutral-500">Date: {formatDate(new Date().toISOString())}</div>
                  <div className="text-[11px] font-bold text-emerald-600 uppercase mt-0.5">
                    Status: {printableReceipt.voucher.status}
                  </div>
                </div>
              </div>

              {/* Student info */}
              <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-3 rounded-lg">
                <div>
                  <span className="text-neutral-500 block">Student Name</span>
                  <span className="font-bold">{printableReceipt.student.fullName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Roll Number</span>
                  <span className="font-mono font-bold">{printableReceipt.student.rollNumber}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Class & Cohort</span>
                  <span>{printableReceipt.voucher.classId}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Guardian Mobile</span>
                  <span className="font-mono">{printableReceipt.student.guardianPhone}</span>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-neutral-500 text-[11px]">
                    <th className="py-2">Fee Head</th>
                    <th className="py-2 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-neutral-700">
                  {printableReceipt.voucher.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2">{it.title}</td>
                      <td className="py-2 text-right font-mono">{formatPKR(it.amount)}</td>
                    </tr>
                  ))}
                  {printableReceipt.voucher.discount > 0 && (
                    <tr className="text-emerald-600">
                      <td className="py-2 font-medium">Institutional Scholarship Discount</td>
                      <td className="py-2 text-right font-mono">-{formatPKR(printableReceipt.voucher.discount)}</td>
                    </tr>
                  )}
                  {printableReceipt.voucher.fine > 0 && (
                    <tr className="text-rose-600">
                      <td className="py-2 font-medium">Late Payment Surcharge</td>
                      <td className="py-2 text-right font-mono">+{formatPKR(printableReceipt.voucher.fine)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 font-bold text-sm">
                    <td className="py-2.5">Net Invoiced Amount</td>
                    <td className="py-2.5 text-right font-mono">{formatPKR(printableReceipt.voucher.totalAmount)}</td>
                  </tr>
                  <tr className="text-emerald-600 font-bold">
                    <td className="py-1.5">Amount Cleared / Paid</td>
                    <td className="py-1.5 text-right font-mono">{formatPKR(printableReceipt.voucher.paidAmount)}</td>
                  </tr>
                  <tr className="text-amber-600 font-bold">
                    <td className="py-1.5">Balance Outstanding</td>
                    <td className="py-1.5 text-right font-mono">{formatPKR(printableReceipt.voucher.remainingAmount)}</td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="pt-8 flex justify-between items-end text-[11px] text-neutral-500">
                <div className="text-center">
                  <div className="border-t border-neutral-400 w-32 pt-1 font-mono">Cashier Signature</div>
                </div>
                <div className="text-center">
                  <div className="border-t border-neutral-400 w-32 pt-1 font-mono">Bursar Seal</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 no-print">
              <button
                onClick={() => setPrintableReceipt(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl text-neutral-500 hover:text-black"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white flex items-center gap-1.5 shadow-sm hover:bg-indigo-500"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official PDF Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
