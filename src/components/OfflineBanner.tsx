'use client';

import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

interface OfflineBannerProps {
  offlineSince: number; // timestamp ms
  cachedAt: number; // timestamp ms
  onReconnectAttempt?: () => void;
  isReconnecting?: boolean;
}

export default function OfflineBanner({
  offlineSince,
  cachedAt,
  onReconnectAttempt,
  isReconnecting = false,
}: OfflineBannerProps) {
  const offlineTimeStr = new Date(offlineSince).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const cachedTimeStr = new Date(cachedAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div 
      id="offline-persistent-banner"
      className="w-full bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 shadow-sm text-amber-900 animate-fade-in"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 mt-0.5 sm:mt-0">
            <WifiOff className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight">
                Offline since {offlineTimeStr} — showing last synced data
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300">
                Cached at {cachedTimeStr}
              </span>
            </div>
            <p className="text-xs text-amber-700/90 mt-0.5">
              Mountain connectivity lost along NH-766. Displayed confidence decays by 10% every 30 minutes without fresh verification.
            </p>
          </div>
        </div>

        {onReconnectAttempt && (
          <button
            onClick={onReconnectAttempt}
            disabled={isReconnecting}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-200/80 hover:bg-amber-200 text-amber-950 font-bold text-xs border border-amber-300 transition shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReconnecting ? 'animate-spin' : ''}`} />
            <span>{isReconnecting ? 'Checking...' : 'Check Connection'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
