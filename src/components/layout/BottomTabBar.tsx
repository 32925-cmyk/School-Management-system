/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  CreditCard,
  Award,
  BookMarked,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomTabBar: React.FC = () => {
  const { role } = useAuth();
  const location = useLocation();

  if (role !== 'STUDENT') return null;

  const tabs = [
    { label: 'Home', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Attendance', path: '/student/attendance', icon: CalendarCheck },
    { label: 'Fees', path: '/student/fees', icon: CreditCard },
    { label: 'Results', path: '/student/results', icon: Award },
    { label: 'Tasks', path: '/student/homework', icon: BookMarked },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-14 bg-white/95 dark:bg-[#0B1020]/95 backdrop-blur-md border-t border-neutral-200 dark:border-[#242E56] flex items-center justify-around px-2"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = location.pathname.startsWith(tab.path);

        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={`flex flex-col items-center justify-center w-full h-full py-1 text-[10px] font-medium transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.7]'}`} />
            <span className="truncate">{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
