'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Compass, 
  Map, 
  AlertTriangle, 
  ShieldCheck, 
  PhoneCall, 
  HelpCircle, 
  Clock, 
  Database, 
  MessageSquareText,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  isSpecial?: boolean;
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Trip Planner', href: '/dashboard', icon: Compass },
  { label: 'Live Corridor Map', href: '/map', icon: Map },
  { label: 'Hazard Guide', href: '/learn/hazards', icon: AlertTriangle },
  { label: 'Ghat Road Safety Tips', href: '/learn/safety-tips', icon: ShieldCheck },
  { label: 'Emergency Contacts', href: '/learn/emergency-contacts', icon: PhoneCall },
  { label: 'How TravelLord Works', href: '/learn/how-it-works', icon: HelpCircle },
  { label: 'Trip History', href: '/history', icon: Clock },
  { label: 'Data Sources & Transparency', href: '/learn/data-sources', icon: Database },
];

export const CHAT_ASSIST_ITEM: NavItem = {
  label: 'Chat Assistant',
  href: '/chat',
  icon: MessageSquareText,
  isSpecial: true,
};

interface SidebarContentProps {
  onItemClick?: () => void;
}

export function SidebarContent({ onItemClick }: SidebarContentProps) {
  const pathname = usePathname();

  const isItemActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/result';
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Top Header Label */}
      <div className="px-5 pt-4 pb-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
          Corridor Navigation
        </span>
      </div>

      {/* Main 8 Navigation Items */}
      <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
        {MAIN_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isItemActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                active
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    active ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-700'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* Visual Divider */}
      <div className="mx-4 my-2 border-t border-slate-200/80" />

      {/* 9th Item: Chat Assistant (Visually Separated at Bottom) */}
      <div className="p-3">
        {(() => {
          const Icon = CHAT_ASSIST_ITEM.icon;
          const active = isItemActive(CHAT_ASSIST_ITEM.href);

          return (
            <Link
              href={CHAT_ASSIST_ITEM.href}
              onClick={onItemClick}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all border ${
                active
                  ? 'bg-emerald-900 text-white border-emerald-950 shadow-sm'
                  : 'bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 border-emerald-200/90'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  active ? 'bg-emerald-800 text-emerald-300' : 'bg-white text-emerald-700 shadow-2xs'
                }`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span>{CHAT_ASSIST_ITEM.label}</span>
                    <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" />
                  </div>
                  <p className={`text-[10px] font-normal leading-tight ${active ? 'text-emerald-200' : 'text-emerald-700/80'}`}>
                    Plan Assist AI
                  </p>
                </div>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
            </Link>
          );
        })()}
      </div>

      {/* Bottom Corridor Tag */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-medium">NH-766 Wayanad</span>
        <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
          Active
        </span>
      </div>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside 
      id="desktop-sidebar"
      className="hidden md:flex flex-col w-64 shrink-0 bg-white border-r border-slate-200 sticky top-16 h-[calc(100vh-4rem)]"
    >
      <SidebarContent />
    </aside>
  );
}
