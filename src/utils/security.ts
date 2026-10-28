/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Simple client-side SHA-256 hash representation for demo / offline storage.
// Production note: Real password hashing must always occur on the backend (e.g. bcrypt/argon2).
export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText) return '';
  try {
    const msgBuffer = new TextEncoder().encode(plainText + '_aurelian_salt_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback if crypto.subtle is restricted
    let hash = 0;
    for (let i = 0; i < plainText.length; i++) {
      hash = (hash << 5) - hash + plainText.charCodeAt(i);
      hash |= 0;
    }
    return 'fallback_' + Math.abs(hash).toString(16);
  }
}

export function generateStrongPassword(): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*';

  const pick = (set: string) => set[Math.floor(Math.random() * set.length)];

  const base = [
    pick(upper),
    pick(upper),
    pick(lower),
    pick(lower),
    pick(numbers),
    pick(numbers),
    pick(symbols),
    pick(lower),
  ];

  // Shuffle
  return base.sort(() => Math.random() - 0.5).join('');
}

export function checkPasswordStrength(password: string): {
  score: number; // 0 to 4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  feedback: string[];
} {
  const feedback: string[] = [];
  if (!password) {
    return { score: 0, label: 'Very Weak', feedback: ['Password is required'] };
  }

  let score = 0;
  if (password.length >= 8) score++;
  else feedback.push('At least 8 characters');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Include uppercase letter');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Include a number');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else feedback.push('Include a special character');

  const labels: Array<'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong'> = [
    'Very Weak',
    'Weak',
    'Fair',
    'Strong',
    'Very Strong',
  ];

  return {
    score,
    label: labels[score] || 'Fair',
    feedback,
  };
}
