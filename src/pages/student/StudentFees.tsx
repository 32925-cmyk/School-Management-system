/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Printer,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
  Smartphone,
  Building,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getFeeVouchers, recordFeePayment, getStudentById } from '../../services/api';
import { FeeVoucher, Student } from '../../types';
import { formatPKR, formatDate } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Logo } from '../../components/common/Logo';

export const StudentFees: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [vouchers, setVouchers] = useState<FeeVoucher[]>([]);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  // Pay Now Gateway Modal
  const [selectedVoucherForPay, setSelectedVoucherForPay] = useState<FeeVoucher | null>(null);
  const [payMethod, setPayMethod] = useState<'ONLINE_CARD' | 'JAZZCASH' | 'EASYPAISA' | 'BANK_TRANSFER'>('JAZZCASH');
  const [accountNumber, setAccountNumber] = useState('0300 2001234');
  const [paymentStep, setPaymentStep] = useState<'METHOD' | 'PROCESSING' | 'SUCCESS'>('METHOD');
  const [latestReceiptNum, setLatestReceiptNum] = useState('');

  // Printable receipt state
  const [receiptVoucher, setReceiptVoucher] = useState<FeeVoucher | null>(null);

  useEffect(() => {
    loadFees();
  }, [currentUser]);

  const loadFees = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [vch, stu] = await Promise.all([
        getFeeVouchers({ studentId: currentUser.id }),
        getStudentById(currentUser.id),
      ]);
      setVouchers(vch);
      setStudent(stu);
    } catch (err: any) {
      showError('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const startPayment = (vch: FeeVoucher) => {
    setSelectedVoucherForPay(vch);
    setPaymentStep('METHOD');
    setPayMethod('JAZZCASH');
    setAccountNumber(currentUser?.phone || '0300 2001234');
  };

  const handleProcessPayment = async () => {
    if (!selectedVoucherForPay || !currentUser) return;
    setPaymentStep('PROCESSING');

    // Simulate 1.5s secure gateway processing handshake
    setTimeout(async () => {
      try {
        const tx = await recordFeePayment(
          selectedVoucherForPay.id,
          selectedVoucherForPay.remainingAmount,
          payMethod,
          `Online student portal payment via ${payMethod}`,
          currentUser
        );

        setLatestReceiptNum(tx.receiptNumber);
        setPaymentStep('SUCCESS');

        // Confetti celebration
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });

        showSuccess('Payment Successful', `Cleared dues of ${formatPKR(selectedVoucherForPay.remainingAmount)}.`);
        loadFees();
      } catch (err: any) {
        setPaymentStep('METHOD');
        showError('Payment Failed', err.message);
      }
    }, 1200);
  };

  const outstandingVouchers = vouchers.filter((v) => v.remainingAmount > 0);
  const totalDues = outstandingVouchers.reduce((s, v) => s + v.remainingAmount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-['Sora'] text-neutral-900 dark:text-white tracking-tight">
          Fee Vouchers & Online Tuition Clearance
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Review monthly voucher statements, download fee receipts, and pay securely via Pakistani digital gateways.
        </p>
      </div>

      {/* Dues Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-neutral-400">Total Outstanding Balance</span>
          <div className="text-3xl font-bold font-mono-numbers text-amber-600 dark:text-amber-400 mt-1">
            {formatPKR(totalDues)}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {outstandingVouchers.length > 0
              ? `${outstandingVouchers.length} voucher(s) awaiting clearance before midterms.`
              : 'All semester fees fully reconciled.'}
          </p>
        </div>

        {outstandingVouchers.length > 0 && (
          <button
            onClick={() => startPayment(outstandingVouchers[0])}
            className="px-6 py-3 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-transform active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span>Pay Current Voucher ({formatPKR(outstandingVouchers[0].remainingAmount)})</span>
          </button>
        )}
      </div>

      {/* Vouchers Table */}
      <div className="rounded-2xl bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] overflow-hidden shadow-xs">
        <div className="p-4 border-b border-neutral-200 dark:border-[#242E56] flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-neutral-400 font-['Sora']">
            Voucher History
          </span>
          <span className="text-xs text-neutral-400">PKR Currency</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 dark:bg-[#0E152B] border-b border-neutral-200 dark:border-[#242E56] text-neutral-500 font-semibold select-none">
              <tr>
                <th className="py-3 px-4">Voucher No</th>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Paid</th>
                <th className="py-3 px-4">Remaining</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-[#1A2347]">
              {vouchers.map((vch) => (
                <tr key={vch.id} className="hover:bg-neutral-50/50 dark:hover:bg-[#1A2347]/50">
                  <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-teal-400">
                    {vch.voucherNumber}
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
                          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {vch.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      {vch.remainingAmount > 0 && (
                        <button
                          onClick={() => startPayment(vch)}
                          className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
                        >
                          Pay Now
                        </button>
                      )}
                      <button
                        onClick={() => setReceiptVoucher(vch)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1A2347]"
                        title="Download Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAY NOW MULTI-STEP GATEWAY MODAL */}
      {selectedVoucherForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121933] border border-neutral-200 dark:border-[#242E56] rounded-2xl shadow-2xl p-6 text-neutral-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#1A2347] pb-3">
              <div>
                <h3 className="font-bold text-base font-['Sora']">Institutional Payment Gateway</h3>
                <p className="text-[11px] text-neutral-400">
                  Voucher #{selectedVoucherForPay.voucherNumber} · Total: {formatPKR(selectedVoucherForPay.remainingAmount)}
                </p>
              </div>
              <button
                onClick={() => setSelectedVoucherForPay(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: METHOD SELECTION */}
            {paymentStep === 'METHOD' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold block text-neutral-700 dark:text-neutral-300">
                    Choose Digital Payment Method
                  </span>
                  {[
                    { key: 'JAZZCASH', label: 'JazzCash Mobile Wallet', desc: 'Instant OTP debited from 03xx mobile account', icon: Smartphone },
                    { key: 'EASYPAISA', label: 'Easypaisa Wallet / In-App QR', desc: 'Direct Telenor Microfinance wallet deduction', icon: Smartphone },
                    { key: 'ONLINE_CARD', label: 'Visa / MasterCard / PayPak', desc: 'Secure debit/credit card clearance', icon: CreditCard },
                    { key: 'BANK_TRANSFER', label: '1Link Direct Transfer / Raast', desc: 'Habib Bank / Meezan Bank digital gateway', icon: Building },
                  ].map((m) => {
                    const Icon = m.icon;
                    const isSelected = payMethod === m.key;

                    return (
                      <div
                        key={m.key}
                        onClick={() => setPayMethod(m.key as any)}
                        className={`p-3 rounded-xl border cursor-pointer transition-colors flex items-center gap-3 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/40'
                            : 'border-neutral-200 dark:border-[#242E56] hover:bg-neutral-50 dark:hover:bg-[#1A2347]'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-neutral-100 dark:bg-[#0B1020] text-neutral-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-xs text-neutral-900 dark:text-white">{m.label}</div>
                          <div className="text-[10px] text-neutral-400">{m.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                    {payMethod === 'ONLINE_CARD' ? 'Card Number' : 'Account Mobile Number (Pakistani Format)'}
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder={payMethod === 'ONLINE_CARD' ? '4111 2222 3333 4444' : '0300 1234567'}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-neutral-300 dark:border-[#242E56] bg-neutral-50 dark:bg-[#0B1020]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    onClick={() => setSelectedVoucherForPay(null)}
                    className="px-4 py-2 text-xs font-medium rounded-xl text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProcessPayment}
                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Authorize {formatPKR(selectedVoucherForPay.remainingAmount)}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: PROCESSING */}
            {paymentStep === 'PROCESSING' && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <div className="space-y-1">
                  <div className="font-semibold text-sm font-['Sora']">Connecting to Banking Network</div>
                  <div className="text-xs text-neutral-400 font-mono">1Link Gateway Handshake in Progress...</div>
                </div>
              </div>
            )}

            {/* Step 3: SUCCESS */}
            {paymentStep === 'SUCCESS' && (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-lg font-['Sora'] text-neutral-900 dark:text-white">
                    Payment Reconciled
                  </h4>
                  <p className="text-xs text-neutral-400">
                    Receipt #{latestReceiptNum} has been recorded in the school treasury and dispatched to your email.
                  </p>
                </div>
                <div className="pt-3 flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedVoucherForPay(null);
                      loadFees();
                    }}
                    className="px-5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PRINTABLE RECEIPT MODAL */}
      {receiptVoucher && student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white border border-neutral-200 rounded-2xl shadow-2xl p-6 text-neutral-900 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between no-print border-b pb-3">
              <span className="font-bold text-sm font-['Sora']">Official Fee Voucher & Receipt</span>
              <button onClick={() => setReceiptVoucher(null)} className="text-neutral-500 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 border border-neutral-300 rounded-xl space-y-4 print-break-inside-avoid text-xs">
              <div className="flex items-start justify-between border-b pb-4">
                <Logo size="sidebar" variant="full" isDark={false} />
                <div className="text-right">
                  <div className="font-mono font-bold text-sm text-indigo-700">
                    {receiptVoucher.voucherNumber}
                  </div>
                  <div className="text-[11px] text-neutral-500">Date: {formatDate(new Date().toISOString())}</div>
                  <div className="text-[11px] font-bold text-emerald-600 uppercase mt-0.5">
                    Status: {receiptVoucher.status}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-neutral-50 p-3 rounded-lg">
                <div>
                  <span className="text-neutral-500 block">Student Name</span>
                  <span className="font-bold">{student.fullName}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Roll Number</span>
                  <span className="font-mono font-bold">{student.rollNumber}</span>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-neutral-500 text-[11px]">
                    <th className="py-2">Fee Head</th>
                    <th className="py-2 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-neutral-700">
                  {receiptVoucher.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2">{it.title}</td>
                      <td className="py-2 text-right font-mono">{formatPKR(it.amount)}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 font-bold text-sm">
                    <td className="py-2">Total Amount</td>
                    <td className="py-2 text-right font-mono">{formatPKR(receiptVoucher.totalAmount)}</td>
                  </tr>
                  <tr className="text-emerald-600 font-bold">
                    <td className="py-1.5">Cleared Paid</td>
                    <td className="py-1.5 text-right font-mono">{formatPKR(receiptVoucher.paidAmount)}</td>
                  </tr>
                  <tr className="text-amber-600 font-bold">
                    <td className="py-1.5">Remaining Due</td>
                    <td className="py-1.5 text-right font-mono">{formatPKR(receiptVoucher.remainingAmount)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-6 flex justify-between items-end text-[11px] text-neutral-500">
                <div className="text-center">
                  <div className="border-t border-neutral-400 w-32 pt-1 font-mono">Bursar Seal</div>
                </div>
                <div className="text-center font-mono text-[10px] text-emerald-600">
                  Verified Electronic Transaction
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 no-print">
              <button
                onClick={() => setReceiptVoucher(null)}
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
