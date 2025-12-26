'use client';

import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { ChevronLeft, ChevronRight, Home, BookOpen, Settings } from 'lucide-react';
import NavItem from './NavItem';

const navigationItems = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Prompts', href: '/prompts', icon: BookOpen },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isHydrated } = useSidebar();

  return (
    <aside
      className={`
        bg-ind-panel border-r border-ind-border flex flex-col
        transition-all duration-300 overflow-hidden
        ${isHydrated && isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="
          flex items-center justify-center h-16
          border-b border-ind-border
          hover:bg-ind-bg/50
          transition-colors duration-200
          text-ind-text-muted hover:text-ind-text
        "
        aria-label={isHydrated && isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isHydrated && isCollapsed ? (
          <ChevronRight className="w-5 h-5" />
        ) : (
          <ChevronLeft className="w-5 h-5" />
        )}
      </button>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <NavItem
              key={item.href}
              icon={<Icon className="w-5 h-5" />}
              label={item.label}
              href={item.href}
              isActive={isActive}
              isCollapsed={isHydrated && isCollapsed}
            />
          );
        })}
      </nav>
    </aside>
  );
}
