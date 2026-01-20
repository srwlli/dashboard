'use client';

import { usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/SidebarContext';
import { ChevronLeft, ChevronRight, Home, Layers, Zap, Settings, FolderTree, Radar, Network, FileText, BarChart3, Users, Lightbulb } from 'lucide-react';
import NavItem from './NavItem';

const mainNavItems = [
  { label: 'Dashboard', href: '/', icon: Home },
  { label: 'Prompts', href: '/prompts', icon: Layers },
  { label: 'Stubs', href: '/assistant2', icon: Lightbulb },
  { label: 'Sessions Hub', href: '/sessions', icon: Users },
  { label: 'Boards', href: '/boards', icon: Zap },
  { label: 'Explorer', href: '/explorer', icon: FolderTree },
  { label: 'Notes', href: '/notes', icon: FileText },
  { label: 'Metrics', href: '/metrics', icon: BarChart3 },
  { label: 'Scanner', href: '/scanner', icon: Radar },
  { label: 'Resources', href: '/resources', icon: Network },
];

const bottomNavItems = [
  { label: 'Settings', href: '/settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar, isHydrated } = useSidebar();

  return (
    <aside
      className={`
        bg-ind-panel border-r border-ind-border flex flex-col
        sticky top-0 h-screen
        transition-all duration-300
        ${isHydrated && isCollapsed
          ? 'w-20 min-w-20 max-w-20 basis-20 flex-shrink-0 flex-grow-0'
          : 'w-64 min-w-64 max-w-64 basis-64 flex-shrink-0 flex-grow-0'
        }
        overflow-hidden
        ${className}
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

      {/* Main Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {mainNavItems.map((item) => {
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

      {/* Bottom Navigation Items */}
      <nav className="px-3 py-4 space-y-2 flex-shrink-0">
        {bottomNavItems.map((item) => {
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
