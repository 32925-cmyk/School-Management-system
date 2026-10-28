/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomTabBar } from './BottomTabBar';
import { CommandPalette } from './CommandPalette';
import { ChangePasswordModal } from '../modals/ChangePasswordModal';
import { useAuth } from '../../context/AuthContext';

export const MainLayout: React.FC = () => {
  const { currentUser, role } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

  // If user must change password, force modal open
  const isForcedPasswordChange = !!currentUser?.mustChangePassword;

  return (
    <div className="min-h-screen flex bg-neutral-100 dark:bg-[#0B1020] text-neutral-900 dark:text-neutral-100 selection:bg-indigo-500 selection:text-white">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <TopBar
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onOpenChangePassword={() => setChangePasswordOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>

        <BottomTabBar />
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        role={role === 'ADMIN' ? 'ADMIN' : 'STUDENT'}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordOpen || isForcedPasswordChange}
        isForced={isForcedPasswordChange}
        onClose={() => setChangePasswordOpen(false)}
      />
    </div>
  );
};
