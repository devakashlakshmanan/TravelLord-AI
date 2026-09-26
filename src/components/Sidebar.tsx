'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Compass,
  Zap,
  GitFork,
  Clock,
  Map,
  Radio,
  History,
  ShieldAlert,
  Settings,
  ChevronRight
} from 'lucide-react';

export interface NavItemConfig {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: {
    text: string;
    type: 'critical' | 'warning' | 'live' | 'primary';
  };
  priority?: 'high' | 'normal';
}

export interface NavSection {
  title: string;
  items: NavItemConfig[];
}

export const PRIMARY_SIDEBAR_SECTIONS: NavSection[] = [
  {
    title: 'OVERVIEW',
    items: [
      {
        label: 'Main Dashboard',
        href: '/dashboard',
        icon: Home,
        priority: 'high'
      },
      {
        label: 'Plan a Safe Trip',
        href: '/plan',
        icon: Compass,
        priority: 'high',
      },
    ],
  },
  {
    title: 'DECISION INTELLIGENCE',
    items: [
      {
        label: 'Action Resolver',
        href: '/action-resolver',
        icon: Zap,
        priority: 'high',
        badge: { text: 'Engine', type: 'primary' }
      },
      {
        label: 'Route Alternatives',
        href: '/route-alternatives',
        icon: GitFork
      },
      {
        label: 'Decision Timeline',
        href: '/decision-timeline',
        icon: Clock
      },
    ],
  },
  {
    title: 'LIVE INTELLIGENCE',
    items: [
      {
        label: 'Live Risk Map',
        href: '/map',
        icon: Map,
        priority: 'high',
      },
      {
        label: 'Hazard Intelligence',
        href: '/hazards',
        icon: Radio
      },
    ],
  },
  {
    title: 'TRIP',
    items: [
      {
        label: 'Trip History',
        href: '/history',
        icon: History
      },
    ],
  },
  {
    title: 'EMERGENCY',
    items: [
      {
        label: 'Emergency Center',
        href: '/emergency',
        icon: ShieldAlert,
        priority: 'high',
        badge: { text: '112', type: 'critical' }
      },
    ],
  },
];

export const SETTINGS_NAV_ITEM: NavItemConfig = {
  label: 'Settings',
  href: '/settings',
  icon: Settings,
};

interface SidebarContentProps {
  onItemClick?: () => void;
}

export function SidebarContent({ onItemClick }: SidebarContentProps) {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/command-center' || pathname === '/result';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 select-none">
      {/* Brand / Logo Header */}
      <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
        <Link href="/dashboard" onClick={onItemClick} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-xs">
            <Zap className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-tight group-hover:text-emerald-400 transition">
              TRAVELORD AI
            </span>
            <span className="block text-[10px] font-mono text-emerald-400/80 uppercase tracking-wider">
              Protective Action OS
            </span>
          </div>
        </Link>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          LIVE
        </span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
        {PRIMARY_SIDEBAR_SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            {/* Section Header */}
            <div className="px-3 pt-1 pb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                {section.title}
              </span>
            </div>

            {/* Section Items */}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);
              const isHighPriority = item.priority === 'high';

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${active
                    ? isHighPriority
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40 shadow-sm'
                      : 'bg-slate-800 text-white border border-slate-700/80 shadow-xs'
                    : isHighPriority
                      ? 'text-slate-200 hover:text-white hover:bg-slate-800/80'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${active
                        ? isHighPriority
                          ? 'text-emerald-400'
                          : 'text-sky-400'
                        : isHighPriority
                          ? 'text-slate-300 group-hover:text-emerald-400'
                          : 'text-slate-500 group-hover:text-slate-300'
                        }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge && (
                      <span
                        className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${item.badge.type === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : item.badge.type === 'live'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : item.badge.type === 'warning'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                          }`}
                      >
                        {item.badge.text}
                      </span>
                    )}
                    {active && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Settings Link & Status Indicator */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        {(() => {
          const Icon = SETTINGS_NAV_ITEM.icon;
          const active = isItemActive(SETTINGS_NAV_ITEM.href);

          return (
            <Link
              href={SETTINGS_NAV_ITEM.href}
              onClick={onItemClick}
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${active
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 ${active ? 'text-slate-200' : 'text-slate-400'}`} />
                <span>{SETTINGS_NAV_ITEM.label}</span>
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            </Link>
          );
        })()}

        <div className="mt-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-mono truncate">NH-766 Wayanad</span>
          <span className="text-[9px] font-bold uppercase text-emerald-400">Telemetry Live</span>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside
      id="desktop-sidebar"
      className="hidden md:flex flex-col w-64 shrink-0 bg-slate-900 border-r border-slate-800 sticky top-16 h-[calc(100vh-4rem)]"
    >
      <SidebarContent />
    </aside>
  );
}
