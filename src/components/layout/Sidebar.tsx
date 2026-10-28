/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Briefcase,
  CalendarCheck,
  CreditCard,
  FileSpreadsheet,
  Clock,
  BookMarked,
  Library,
  Bus,
  FileCheck2,
  Bell,
  CalendarDays,
  LifeBuoy,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  BookOpen,
  Award,
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}) => {
  const { role, currentUser } = useAuth();
  const { t } = useTheme();
  const location = useLocation();

  const adminNavGroups = [
    {
      group: 'Core Administration',
      items: [
        { label: t('Dashboard', 'Dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
        { label: t('Students', 'Students'), path: '/admin/students', icon: Users },
        { label: t('Classes', 'Classes & Sections'), path: '/admin/classes', icon: GraduationCap },
        { label: t('Teachers', 'Teachers & Staff'), path: '/admin/teachers', icon: Briefcase },
      ],
    },
    {
      group: 'Academics',
      items: [
        { label: t('Attendance', 'Attendance'), path: '/admin/attendance', icon: CalendarCheck },
        { label: t('Timetable', 'Timetable'), path: '/admin/timetable', icon: Clock },
        { label: t('Examinations', 'Examinations & Marks'), path: '/admin/exams', icon: FileSpreadsheet },
        { label: t('Homework', 'Homework & Tasks'), path: '/admin/homework', icon: BookMarked },
      ],
    },
    {
      group: 'Operations & Finance',
      items: [
        { label: t('Fees & Finance', 'Fees & Finance'), path: '/admin/fees', icon: CreditCard },
        { label: t('Library', 'Library Catalogue'), path: '/admin/library', icon: Library },
        { label: t('Transport', 'Transport & Routes'), path: '/admin/transport', icon: Bus },
        { label: 'Leave Requests', path: '/admin/leaves', icon: FileCheck2 },
      ],
    },
    {
      group: 'Communication & System',
      items: [
        { label: t('Announcements', 'Announcements'), path: '/admin/notices', icon: Bell },
        { label: t('Calendar', 'Academic Calendar'), path: '/admin/events', icon: CalendarDays },
        { label: 'Support & Tickets', path: '/admin/tickets', icon: LifeBuoy },
        { label: t('Reports', 'Reports & Analytics'), path: '/admin/reports', icon: BarChart3 },
        { label: t('Settings', 'Settings & Backups'), path: '/admin/settings', icon: Settings },
      ],
    },
  ];

  const studentNavGroups = [
    {
      group: 'Student Workspace',
      items: [
        { label: t('Dashboard', 'Home Dashboard'), path: '/student/dashboard', icon: LayoutDashboard },
        { label: t('My Profile', 'My Profile'), path: '/student/profile', icon: Users },
        { label: t('My Attendance', 'My Attendance'), path: '/student/attendance', icon: CalendarCheck },
        { label: t('My Fees', 'My Fees & Payments'), path: '/student/fees', icon: CreditCard },
      ],
    },
    {
      group: 'Learning & Progress',
      items: [
        { label: t('My Results', 'My Results & Rank'), path: '/student/results', icon: Award },
        { label: t('Timetable', 'Weekly Timetable'), path: '/student/timetable', icon: Clock },
        { label: t('Homework', 'Homework & Submissions'), path: '/student/homework', icon: BookMarked },
      ],
    },
    {
      group: 'Campus Services',
      items: [
        { label: t('Announcements', 'Notices & Circulars'), path: '/student/notices', icon: Bell },
        { label: t('Library', 'My Library Books'), path: '/student/library', icon: Library },
        { label: t('Transport', 'My Bus Route'), path: '/student/transport', icon: Bus },
        { label: 'Contact Admin / Help', path: '/student/support', icon: LifeBuoy },
      ],
    },
  ];

  const navGroups = role === 'ADMIN' ? adminNavGroups : studentNavGroups;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out flex flex-col bg-white dark:bg-[#121933] border-r border-neutral-200 dark:border-[#242E56] ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-[#242E56] shrink-0">
          <NavLink to={role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} className="overflow-hidden">
            <Logo
              size={isCollapsed ? 'favicon' : 'sidebar'}
              variant={isCollapsed ? 'markOnly' : 'full'}
            />
          </NavLink>
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1A2347] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pb-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider font-['Plus_Jakarta_Sans'] select-none">
                  {group.group}
                </div>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname.startsWith(item.path);

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onMobileClose}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                          : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1A2347] hover:text-neutral-900 dark:hover:text-white'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-105 ${
                          isActive ? 'text-white' : 'text-neutral-400 group-hover:text-indigo-500 dark:group-hover:text-teal-400'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Card at Bottom of Sidebar */}
        <div className="p-3 border-t border-neutral-200 dark:border-[#242E56] shrink-0">
          <div className={`flex items-center gap-2.5 p-2 rounded-xl bg-neutral-50 dark:bg-[#1A2347] ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {currentUser?.fullName ? currentUser.fullName[0] : 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                  {currentUser?.fullName}
                </div>
                <div className="text-[10px] text-neutral-400 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-teal-400" />
                  <span>{currentUser?.role === 'ADMIN' ? 'Administrator' : 'Student Portal'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
