'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Users, 
  ThumbsUp, 
  ThumbsDown, 
  MapPin, 
  Plus, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { WAYANAD_CHECKPOINTS } from '@/lib/engine/types';
import ProvenanceBadge from '@/components/ProvenanceBadge';

interface CrowdReport {
  id: string;
  category: string;
  segmentName: string;
  segmentId: string;
  description: string;
  timestamp: string;
  status: 'still_blocked' | 'cleared';
  created_at: string;
}

export default function CrowdVerificationPage() {
  const supabase = createClient();
  const [reports, setReports] = useState<CrowdReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState('S3');
  const [status, setStatus] = useState<'still_blocked' | 'cleared'>('still_blocked');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadReports = async () => {
    try {
      const { data } = await supabase
        .from('crowd_verifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(25);

      if (data && data.length > 0) {
        const formatted: CrowdReport[] = data.map((d: any) => {
          const seg = WAYANAD_CHECKPOINTS.find((c) => c.id === d.segment_id);
          return {
            id: d.id,
            category: 'ROAD_STATUS',
            segmentName: seg ? `${seg.name} (${seg.id})` : d.segment_id,
            segmentId: d.segment_id,
            description: d.status === 'cleared' ? 'Road condition reported as CLEARED.' : 'Road condition reported as STILL BLOCKED / ACTIVE HAZARD.',
            timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: d.status,
            created_at: d.created_at
          };
        });
        setReports(formatted);
      }
    } catch (e) {
      console.warn('Error fetching crowd verifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id || 'anonymous-traveler';

      const { error } = await supabase
        .from('crowd_verifications')
        .insert({
          segment_id: selectedSegment,
          user_id: userId,
          status: status
        });

      if (error) {
        setFeedback(`Submission error: ${error.message}`);
      } else {
        setFeedback('Observation logged to Supabase crowd_verifications table!');
        setShowModal(false);
        await loadReports();
      }
    } catch (err: any) {
      setFeedback('Failed to log report.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-2">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Peer Verification Data Stream</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Crowd Hazard Verification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Connected directly to Supabase <code className="text-slate-800 font-mono">crowd_verifications</code>. Real-time traveler observations calibrate confidence weights by &plusmn;0.05.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition shrink-0"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>Report Road Condition</span>
        </button>
      </div>

      <ProvenanceBadge origin="COMMUNITY_REPORTED" source="Supabase crowd_verifications Table" />

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          {feedback}
        </div>
      )}

      {/* Modal for Submission */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl max-w-md w-full space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">Record Live Status</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Corridor Checkpoint</label>
                <select
                  value={selectedSegment}
                  onChange={(e) => setSelectedSegment(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium bg-slate-50"
                >
                  {WAYANAD_CHECKPOINTS.map((cp) => (
                    <option key={cp.id} value={cp.id}>
                      {cp.name} ({cp.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Observed State</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('still_blocked')}
                    className={`py-2 rounded-xl font-bold border transition ${
                      status === 'still_blocked'
                        ? 'bg-rose-50 border-rose-400 text-rose-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Still Blocked
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus('cleared')}
                    className={`py-2 rounded-xl font-bold border transition ${
                      status === 'cleared'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Cleared Now
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submitting ? 'Submitting to Supabase...' : 'Log to Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 flex items-center justify-center text-xs text-slate-500 gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading database records...</span>
          </div>
        ) : reports.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200 p-8">
            No recent crowd reports recorded in database. Click &ldquo;Report Road Condition&rdquo; to add one.
          </div>
        ) : (
          reports.map((rep) => (
            <div
              key={rep.id}
              className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    rep.status === 'cleared' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {rep.status === 'cleared' ? 'Cleared' : 'Still Blocked'}
                  </span>
                  <span className="text-xs font-bold text-slate-900">{rep.segmentName}</span>
                  <span className="text-xs text-slate-400 font-mono">&bull; {rep.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600">{rep.description}</p>
              </div>

              <span className="text-xs font-mono font-bold text-slate-500 shrink-0">
                {rep.status === 'cleared' ? '-5% Risk Adj' : '+5% Risk Adj'}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
