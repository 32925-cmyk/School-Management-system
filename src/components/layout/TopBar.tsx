/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Sun,
  Moon,
  Globe,
  Bell,
  LogOut,
  KeyRound,
  User as UserIcon,
  Check,
  ChevronDown,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getNotifications, markNotificationRead } from '../../services/api';
import { NotificationItem } from '../../types';
import { DownloadProjectModal } from '../modals/DownloadProjectModal';

interface TopBarProps {
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenChangePassword: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileSidebar,
  onOpenCommandPalette,
  onOpenChangePassword,
}) => {
  const { currentUser, logout, role } = useAuth();
  const { theme, toggleTheme, language, setLanguage, isUrdu } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentUser) {
      getNotifications(currentUser.id).then((data) => setNotifications(data));
    }
  }, [currentUser, location.pathname]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotifs = notifications.filter((n) => !n.isRead);

  // Compute clean breadcrumbs
  const pathParts = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathParts.map((p) =>
    p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ')
  );

  const handleNotifClick = async (notif: NotificationItem) => {
    await markNotificationRead(notif.id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
    );
    setShowNotifMenu(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#0B1020]/90 backdrop-blur-md border-b border-neutral-200 dark:border-[#242E56] px-4 md:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1A2347]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 truncate">
          <span>Aurelian Heights</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <span className="text-neutral-300 dark:text-neutral-600">/</span>
              <span className={idx === breadcrumbs.length - 1 ? 'font-semibold text-neutral-900 dark:text-white' : ''}>
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center: Command Palette Trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-[#242E56] bg-neutral-50 dark:bg-[#121933] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors text-xs w-48 sm:w-64 max-w-full justify-between"
      >
        <span className="flex items-center gap-2 truncate">
          <Search className="w-3.5 h-3.5 text-neutral-400" />
          <span className="truncate">Quick jump...</span>
        </span>
        <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-neutral-200 dark:bg-[#1A2347] text-neutral-500">
          ⌘K
        </kbd>
      </button>

      {/* Right: Actions, Language, Theme, Notifications & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Download Project ZIP */}
        <a
          href="/aurelian-heights-academy.zip"
          download="aurelian-heights-academy.zip"
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1A2347] transition-colors flex items-center gap-1.5 text-xs font-semibold"
          title="Download Full Project ZIP (.zip)"
        >
          <Download className="w-4 h-4 text-teal-500" />
          <span className="hidden lg:inline text-[11px] text-teal-400">Download .ZIP</span>
        </a>

        {/* Language switch */}
        <button
          onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1A2347] transition-colors flex items-center gap-1 text-xs font-semibold"
          title={language === 'en' ? 'Switch to Urdu' : 'Switch to English'}
        >
          <Globe className="w-4 h-4 text-teal-500" />
          <span className="hidden sm:inline">{language === 'en' ? 'اردو' : 'EN'}</span>
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1A2347] transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600" />
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#1A2347] transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#0B1020]" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#121933] shadow-2xl border border-neutral-200 dark:border-[#242E56] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-[#242E56] flex items-center justify-between">
                <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                  Notifications
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  {unreadNotifs.length} unread
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-neutral-100 dark:divide-[#1A2347]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-neutral-500">
                    No notifications at this time
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={`p-3 text-xs cursor-pointer hover:bg-neutral-50 dark:hover:bg-[#1A2347] transition-colors ${
                        !notif.isRead ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {notif.title}
                        </span>
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="mt-1 text-neutral-600 dark:text-neutral-400 line-clamp-2">
                        {notif.message}
                      </p>
                      <span className="mt-1.5 inline-block text-[10px] text-neutral-400">
                        {notif.createdAt ? notif.createdAt.split('T')[0] : 'Today'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-[#1A2347] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser?.fullName ? currentUser.fullName[0] : 'U'}
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#121933] shadow-2xl border border-neutral-200 dark:border-[#242E56] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-neutral-200 dark:border-[#242E56]">
                <div className="font-semibold text-xs text-neutral-900 dark:text-white truncate">
                  {currentUser?.fullName}
                </div>
                <div className="text-[11px] text-neutral-400 truncate">{currentUser?.email}</div>
                <div className="mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  {currentUser?.role === 'ADMIN' ? 'Institutional Admin' : 'Enrolled Student'}
                </div>
              </div>

              {role === 'STUDENT' && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/student/profile');
                  }}
                  className="w-full px-4 py-2 text-xs text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1A2347] flex items-center gap-2.5"
                >
                  <UserIcon className="w-4 h-4 text-neutral-400" />
                  <span>My Profile</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onOpenChangePassword();
                }}
                className="w-full px-4 py-2 text-xs text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#1A2347] flex items-center gap-2.5"
              >
                <KeyRound className="w-4 h-4 text-neutral-400" />
                <span>Change Password</span>
              </button>

              <div className="border-t border-neutral-200 dark:border-[#242E56] my-1" />

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full px-4 py-2 text-xs text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2.5"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Deployment & Download Modal */}
      <DownloadProjectModal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
      />
    </header>
  );
};
