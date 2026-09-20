'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Users, CheckCircle, AlertOctagon, Loader2, Check } from 'lucide-react';

interface CrowdVerificationProps {
  segmentId: string;
  segmentName: string;
  onVerificationSubmitted: () => Promise<void>;
}

export default function CrowdVerification({
  segmentId,
  segmentName,
  onVerificationSubmitted,
}: CrowdVerificationProps) {
  const supabase = createClient();
  const [submitting, setSubmitting] = useState<'cleared' | 'still_blocked' | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleTap = async (status: 'cleared' | 'still_blocked') => {
    setSubmitting(status);
    setFeedback(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setFeedback('Please sign in to report road status.');
        setSubmitting(null);
        return;
      }

      // 1. Insert into crowd_verifications table
      const { error } = await supabase
        .from('crowd_verifications')
        .insert({
          segment_id: segmentId,
          user_id: session.user.id,
          status: status,
        });

      if (error) {
        console.error('Error recording crowd verification:', error);
        setFeedback(`Report failed: ${error.message}`);
        setSubmitting(null);
        return;
      }

      setFeedback(status === 'cleared' ? 'Reported as Cleared! Updating route...' : 'Reported as Still Blocked! Updating route...');

      // 2. Trigger live re-evaluation without full page reload
      await onVerificationSubmitted();

      setTimeout(() => {
        setFeedback(null);
      }, 4000);
    } catch (err: any) {
      console.error('Crowd verification exception:', err);
      setFeedback('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
          <Users className="w-4 h-4 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Still on this road? Help others</h2>
          <p className="text-xs text-slate-500">
            Reporting condition for <span className="font-semibold text-slate-800">{segmentName}</span>
          </p>
        </div>
      </div>

      <p className="text-xs text-slate-600 mb-5 leading-relaxed">
        Your real-time tap calibrates data recency and confidence for all travelers navigating NH-766 behind you.
      </p>

      {/* Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Cleared Button */}
        <button
          id="btn-cleared-now"
          onClick={() => handleTap('cleared')}
          disabled={submitting !== null}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold text-sm transition shadow-2xs disabled:opacity-60"
        >
          {submitting === 'cleared' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Cleared now</span>
            </>
          )}
        </button>

        {/* Still Blocked Button */}
        <button
          id="btn-still-blocked"
          onClick={() => handleTap('still_blocked')}
          disabled={submitting !== null}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 font-semibold text-sm transition shadow-2xs disabled:opacity-60"
        >
          {submitting === 'still_blocked' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-rose-700" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>Still blocked</span>
            </>
          )}
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className="mt-4 p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-800 flex items-center gap-2 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
}
