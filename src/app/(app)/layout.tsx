'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import Sidebar, { SidebarContent } from '@/components/Sidebar';
import { ReplayProvider } from '@/lib/replay/replayState';
import { Menu, X, Loader2 } from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Exact session check pattern from dashboard/page.tsx
  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    }

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-700 mb-3" />
        <p className="text-xs text-slate-500 font-medium">Verifying corridor credentials...</p>
      </div>
    );
  }

  return (
    <ReplayProvider>
      <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] bg-slate-50">
        {/* Mobile Top Bar with Hamburger Trigger */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
          <button
            id="mobile-sidebar-toggle-btn"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Corridor Menu
          </span>
          <div className="w-9" />
        </div>

        {/* Mobile Slide-in Drawer with Backdrop Overlay */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            {/* Backdrop */}
            <div 
              id="mobile-drawer-backdrop"
              onClick={() => setMobileDrawerOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in" 
            />

            {/* Drawer Panel */}
            <div 
              id="mobile-sidebar-drawer"
              className="relative w-72 max-w-[80vw] h-full bg-white border-r border-slate-200 shadow-2xl flex flex-col z-10 animate-slide-in-left"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                  TravelLord AI
                </span>
                <button
                  id="close-mobile-drawer-btn"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
                  aria-label="Close navigation"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <SidebarContent onItemClick={() => setMobileDrawerOpen(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Desktop Persistent Left Sidebar */}
        <Sidebar />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </ReplayProvider>
  );
}
