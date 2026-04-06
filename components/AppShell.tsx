'use client';

import { ReactNode } from 'react';
import { SidebarNav } from './SidebarNav';
import { TopBar } from './TopBar';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white md:flex">
          <div className="flex-1 overflow-y-auto">
            <SidebarNav />
          </div>
          <div className="border-t border-slate-200 p-4">
            <p className="text-xs text-slate-500">
              College Administrative Workflow System
            </p>
          </div>
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
