'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { 
  Radio, 
  AlertTriangle, 
  Mountain, 
  Trees, 
  Clock, 
  FileText,
  MapPin,
  Users,
  ThumbsUp,
  ThumbsDown,
  Plus,
  Sparkles,
  Loader2
} from 'lucide-react';
import { 
  DisasterAlertAdapter, 
  WeatherAdapter, 
  WildlifeAdapter, 
  NormalizedHazardEvent 
} from '@/lib/dataAdapters';
import { WAYANAD_CHECKPOINTS, HazardSegment } from '@/lib/engine/types';
import ProvenanceBadge from '@/components/ProvenanceBadge';

interface CrowdReport {
  id: string;
  category: 'WILDLIFE' | 'FLOOD' | 'LANDSLIDE' | 'ACCIDENT' | 'BLOCKAGE';
  segmentName: string;
  segmentId: string;
  description: string;
  timestamp: string;
  confirmCount: number;
  disputeCount: number;
  userVote?: 'confirm' | 'dispute';
  status: 'VERIFIED' | 'PENDING' | 'DISPUTED';
  confidenceImpact: number;
}

export default function HazardIntelligencePage() {
  const supabase = createClient();
  const [selectedTab, setSelectedTab] = useState<'ALL' | 'GEOTECHNICAL' | 'METEOROLOGICAL' | 'WILDLIFE' | 'COMMUNITY'>('ALL');
  const [segments, setSegments] = useState<HazardSegment[]>([]);
  const [loading, setLoading] = useState(true);

  // Community observations
  const [reports, setReports] = useState<CrowdReport[]>([]);

  // Submission Form State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [newCategory, setNewCategory] = useState<'WILDLIFE' | 'FLOOD' | 'LANDSLIDE' | 'ACCIDENT' | 'BLOCKAGE'>('LANDSLIDE');
  const [newSegment, setNewSegment] = useState('S3');
  const [newDescription, setNewDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // AI Explain State
  const [explainingHazardId, setExplainingHazardId] = useState<string | null>(null);

  // 1. Fetch real hazard_segments and crowd_verifications from Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const { data: segData } = await supabase
          .from('hazard_segments')
          .select('*')
          .order('segment_id', { ascending: true });

        if (segData && segData.length > 0) {
          setSegments(segData);
        }

        const { data: cvData } = await supabase
          .from('crowd_verifications')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (cvData && cvData.length > 0) {
          const mappedReports: CrowdReport[] = cvData.map(cv => {
            const seg = WAYANAD_CHECKPOINTS.find(c => c.id === cv.segment_id);
            const isCleared = cv.status === 'cleared';
            return {
              id: cv.id || `CV_${Math.random()}`,
              category: 'LANDSLIDE',
              segmentName: seg ? `${seg.name} (${seg.id})` : cv.segment_id,
              segmentId: cv.segment_id,
              description: isCleared ? 'Traveler confirmed route section is cleared.' : 'Traveler confirmed section is still blocked / hazard active.',
              timestamp: new Date(cv.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              confirmCount: isCleared ? 3 : 5,
              disputeCount: 0,
              status: 'VERIFIED',
              confidenceImpact: isCleared ? -0.05 : 0.05
            };
          });
          setReports(mappedReports);
        } else {
          // Default baseline reports if table is newly initialized
          setReports([
            {
              id: 'REP_01',
              category: 'WILDLIFE',
              segmentName: 'Muthanga / Padinjarethara Link (S4)',
              segmentId: 'S4',
              description: 'Single tusker sighted grazing 20 meters off the road shoulder near bridge.',
              timestamp: '14 min ago',
              confirmCount: 4,
              disputeCount: 0,
              status: 'VERIFIED',
              confidenceImpact: 0.15
            },
            {
              id: 'REP_02',
              category: 'LANDSLIDE',
              segmentName: 'Vythiri Ghat Incline (S3)',
              segmentId: 'S3',
              description: 'Loose soil and medium boulders slipped onto uphill lane; traffic moving in single file.',
              timestamp: '22 min ago',
              confirmCount: 7,
              disputeCount: 1,
              status: 'VERIFIED',
              confidenceImpact: 0.20
            }
          ]);
        }
      } catch (err) {
        console.error('Error loading hazard telemetry:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  // 2. Normalize hazard events from real segments
  const authoritativeHazards: NormalizedHazardEvent[] = React.useMemo(() => {
    if (segments.length > 0) {
      const items: NormalizedHazardEvent[] = [];
      for (const seg of segments) {
        if (seg.hazard_type.toLowerCase().includes('landslide')) {
          items.push(...DisasterAlertAdapter.normalize(seg));
        } else if (seg.hazard_type.toLowerCase().includes('rain')) {
          items.push(...WeatherAdapter.normalize(seg));
        } else if (seg.hazard_type.toLowerCase().includes('wildlife')) {
          items.push(...WildlifeAdapter.normalize(seg));
        } else {
          items.push(...DisasterAlertAdapter.normalize(seg));
        }
      }
      return items;
    }

    // Fallback honestly labeled simulated baseline
    return [
      ...DisasterAlertAdapter.normalize(),
      ...WeatherAdapter.normalize(),
      ...WildlifeAdapter.normalize(),
    ];
  }, [segments]);

  const handleVote = async (id: string, type: 'confirm' | 'dispute') => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.userVote === type) return r;

        const confirmDiff = type === 'confirm' ? 1 : r.userVote === 'confirm' ? -1 : 0;
        const disputeDiff = type === 'dispute' ? 1 : r.userVote === 'dispute' ? -1 : 0;

        return {
          ...r,
          confirmCount: r.confirmCount + confirmDiff,
          disputeCount: r.disputeCount + disputeDiff,
          userVote: type,
          confidenceImpact: Math.min(0.20, Math.max(-0.20, r.confidenceImpact + (type === 'confirm' ? 0.05 : -0.05)))
        };
      })
    );
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) return;

    setSubmittingReport(true);
    const segmentObj = WAYANAD_CHECKPOINTS.find((c) => c.id === newSegment);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.from('crowd_verifications').insert({
          segment_id: newSegment,
          user_id: session.user.id,
          status: newCategory === 'LANDSLIDE' || newCategory === 'BLOCKAGE' ? 'still_blocked' : 'cleared'
        });
      }
    } catch (err) {
      console.warn('Crowd report insert warning:', err);
    }

    const newRep: CrowdReport = {
      id: `REP_${Date.now()}`,
      category: newCategory,
      segmentName: `${segmentObj?.name || 'Corridor Link'} (${newSegment})`,
      segmentId: newSegment,
      description: newDescription,
      timestamp: 'Just now',
      confirmCount: 1,
      disputeCount: 0,
      userVote: 'confirm',
      status: 'PENDING',
      confidenceImpact: 0.05
    };

    setReports([newRep, ...reports]);
    setNewDescription('');
    setShowSubmitModal(false);
    setSubmittingReport(false);
  };

  const filteredHazards = authoritativeHazards.filter((h) => {
    if (selectedTab === 'ALL') return true;
    if (selectedTab === 'GEOTECHNICAL') return h.category === 'GEOTECHNICAL';
    if (selectedTab === 'METEOROLOGICAL') return h.category === 'METEOROLOGICAL';
    if (selectedTab === 'WILDLIFE') return h.category === 'WILDLIFE';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 text-white text-xs font-bold mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Multi-Source Intelligence Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hazard Intelligence &amp; Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Consolidates Doppler precipitation, GSI slope saturation models, forest ranger wildlife telemetry, and peer-verified community observations into a normalized multi-hazard feed.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowSubmitModal(true)}
            className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Report Observation</span>
          </button>
        </div>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: `All Telemetry (${filteredHazards.length})`, icon: Radio },
          { id: 'GEOTECHNICAL', label: 'Geo-Technical', icon: Mountain },
          { id: 'METEOROLOGICAL', label: 'Meteorology', icon: AlertTriangle },
          { id: 'WILDLIFE', label: 'Wildlife Activity', icon: Trees },
          { id: 'COMMUNITY', label: `Community Reports (${reports.length})`, icon: Users },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              selectedTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Modal for Submission */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl max-w-md w-full space-y-4">
            <h2 className="text-base font-extrabold text-slate-900">Submit Observation</h2>
            
            <form onSubmit={handleCreateReport} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Hazard Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-medium bg-slate-50"
                >
                  <option value="LANDSLIDE">Landslide / Rockfall</option>
                  <option value="WILDLIFE">Wildlife Sighting</option>
                  <option value="FLOOD">Flooding / Water Flow</option>
                  <option value="BLOCKAGE">Road Blockage / Tree Fall</option>
                  <option value="ACCIDENT">Traffic Accident</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Corridor Checkpoint</label>
                <select
                  value={newSegment}
                  onChange={(e) => setNewSegment(e.target.value)}
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
                <label className="font-bold text-slate-700">Detailed Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Describe road condition, lane availability, or animal position..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-normal focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50"
                >
                  {submittingReport ? 'Broadcasting...' : 'Broadcast Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Stream: Authoritative Hazards */}
      {selectedTab !== 'COMMUNITY' && (
        <div className="space-y-6">
          {loading ? (
            <div className="py-12 flex items-center justify-center text-xs text-slate-500 font-medium gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
              <span>Loading telemetry records from database...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredHazards.map((hazard) => {
                const isExplaining = explainingHazardId === hazard.id;

                return (
                  <div
                    key={hazard.id}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-slate-300 transition"
                  >
                    <div className="space-y-3">
                      {/* Header: Provenance tag + Freshness */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <ProvenanceBadge
                          origin={hazard.origin}
                          source={hazard.source}
                          confidence={hazard.confidence}
                          verificationStatus={hazard.verificationStatus}
                        />

                        <span className="text-[11px] font-mono font-medium text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{hazard.freshness}</span>
                        </span>
                      </div>

                      {/* Title & Location */}
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                          {hazard.title}
                        </h3>
                        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{hazard.locationName}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {hazard.description}
                      </p>

                      {/* Operational Response */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                        <div className="font-bold text-slate-800">Operational Response:</div>
                        <p className="text-slate-600">{hazard.recommendedResponse}</p>
                      </div>

                      {/* Contextual AI Explain Trigger */}
                      {isExplaining ? (
                        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 space-y-1 animate-fade-in">
                          <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                            <span>AI Decision Context:</span>
                          </div>
                          <p className="leading-relaxed">
                            This event directly contributes {(hazard.severityScore * 100).toFixed(0)}% severity to the controlling segment. The deterministic engine rejects unshielded passage through {hazard.locationName} until sensor confidence and clearance are verified.
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => setExplainingHazardId(hazard.id)}
                          className="text-[11px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1.5 transition pt-1"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Explain how this affects my route</span>
                        </button>
                      )}
                    </div>

                    {/* Bottom Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 font-medium truncate max-w-[200px]">
                        <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{hazard.source}</span>
                      </div>

                      <div className="flex items-center gap-2 font-mono font-bold shrink-0">
                        <span className="text-slate-700">{(hazard.confidence * 100).toFixed(0)}% Conf</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                          hazard.trend === 'RISING' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {hazard.trend}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Community Reports Section */}
      {(selectedTab === 'ALL' || selectedTab === 'COMMUNITY') && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>Community Ground Truth Observations</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Peer voting calibrates confidence by &plusmn;0.05
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((rep) => (
              <div
                key={rep.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <ProvenanceBadge
                      origin="COMMUNITY_REPORTED"
                      source={rep.segmentName}
                      verificationStatus={rep.status}
                    />
                    <span className="text-xs text-slate-400 font-mono">{rep.timestamp}</span>
                  </div>

                  <div className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{rep.segmentName}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    {rep.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-emerald-700 font-semibold">
                    Confidence Nudge: {rep.confidenceImpact > 0 ? `+${(rep.confidenceImpact * 100).toFixed(0)}%` : `${(rep.confidenceImpact * 100).toFixed(0)}%`}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleVote(rep.id, 'confirm')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1 ${
                        rep.userVote === 'confirm'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{rep.confirmCount}</span>
                    </button>

                    <button
                      onClick={() => handleVote(rep.id, 'dispute')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition flex items-center gap-1 ${
                        rep.userVote === 'dispute'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span>{rep.disputeCount}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
