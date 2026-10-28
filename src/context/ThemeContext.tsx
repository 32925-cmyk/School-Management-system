/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';
type Language = 'en' | 'ur';

interface ThemeContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  isUrdu: boolean;
  t: (key: string, defaultText: string) => string;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Core Urdu translations for institutional navigation & key labels
const URDU_DICTIONARY: Record<string, string> = {
  'Dashboard': 'ڈیش بورڈ',
  'Students': 'طلباء و طالبات',
  'Classes': 'کلاسز اور سیکشنز',
  'Teachers': 'اساتذہ کرام',
  'Attendance': 'حاضری کا نظام',
  'Fees & Finance': 'فیس اور فنانس',
  'Examinations': 'امتحانات اور نتائج',
  'Timetable': 'ٹائم ٹیبل',
  'Homework': 'ہوم ورک اور اسائنمنٹس',
  'Library': 'کتب خانہ',
  'Transport': 'ٹرانسپورٹ و بسیں',
  'Announcements': 'اعلانات و نوٹسز',
  'Calendar': 'تعلیمی کیلنڈر',
  'Reports': 'رپورٹس اور تجزیات',
  'Settings': 'سیٹنگز',
  'Logout': 'لاگ آؤٹ',
  'Search': 'تلاش کریں...',
  'Pay Now': 'ابھی ادا کریں',
  'Present': 'حاضر',
  'Absent': 'غیر حاضر',
  'Late': 'تاخیر',
  'Leave': 'رخصت',
  'Paid': 'ادا شدہ',
  'Unpaid': 'غیر ادا شدہ',
  'Overdue': 'واجب الادا',
  'My Profile': 'میری پروفائل',
  'My Fees': 'میری فیسیں',
  'My Results': 'میرے امتحانی نتائج',
  'My Attendance': 'میری حاضری',
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('ah_theme');
    return (saved as Theme) || 'dark';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('ah_lang');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('ah_theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (language === 'ur') {
      root.setAttribute('dir', 'rtl');
      root.setAttribute('lang', 'ur');
    } else {
      root.setAttribute('dir', 'ltr');
      root.setAttribute('lang', 'en');
    }
    localStorage.setItem('ah_lang', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, defaultText: string) => {
    if (language === 'ur' && URDU_DICTIONARY[key]) {
      return URDU_DICTIONARY[key];
    }
    return defaultText;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        language,
        toggleTheme,
        setLanguage,
        isUrdu: language === 'ur',
        t,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
