/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatPKR(amount: number): string {
  if (isNaN(amount)) return 'PKR 0';
  return `PKR ${amount.toLocaleString('en-PK', {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function validatePakistaniPhone(phone: string): { isValid: boolean; formatted: string } {
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // standard formats: 03001234567 or +923001234567 or 923001234567
  const regex = /^(?:\+92|92|0)?(3\d{9})$/;
  const match = cleaned.match(regex);
  if (match) {
    const nationalNumber = match[1];
    return {
      isValid: true,
      formatted: `+92 ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3)}`,
    };
  }
  return { isValid: false, formatted: phone };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
