import React from 'react';
import { Database, Radio, Sparkles, History, Users, Eye } from 'lucide-react';

export type DataOrigin = 
  | 'LIVE' 
  | 'FORECAST' 
  | 'MODELLED' 
  | 'HISTORICAL' 
  | 'COMMUNITY_REPORTED' 
  | 'SIMULATED';

interface ProvenanceBadgeProps {
  origin?: DataOrigin;
  source: string;
  lastUpdated?: string;
  segmentName?: string;
  segmentId?: string;
  confidence?: number;
  verificationStatus?: string;
  className?: string;
}

export default function ProvenanceBadge({
  origin = 'MODELLED',
  source,
  lastUpdated,
  segmentName,
  segmentId,
  confidence,
  verificationStatus,
  className = '',
}: ProvenanceBadgeProps) {
  const getBadgeStyle = () => {
    switch (origin) {
      case 'LIVE':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: <Radio className="w-3 h-3 text-emerald-600 animate-pulse shrink-0" />,
          label: 'LIVE',
        };
      case 'FORECAST':
        return {
          bg: 'bg-sky-50 text-sky-800 border-sky-200',
          icon: <Eye className="w-3 h-3 text-sky-600 shrink-0" />,
          label: 'FORECAST',
        };
      case 'COMMUNITY_REPORTED':
        return {
          bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
          icon: <Users className="w-3 h-3 text-indigo-600 shrink-0" />,
          label: 'COMMUNITY REPORTED',
        };
      case 'HISTORICAL':
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: <History className="w-3 h-3 text-slate-500 shrink-0" />,
          label: 'HISTORICAL',
        };
      case 'SIMULATED':
        return {
          bg: 'bg-purple-50 text-purple-800 border-purple-200',
          icon: <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />,
          label: 'SIMULATED DEMO',
        };
      case 'MODELLED':
      default:
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
          icon: <Database className="w-3 h-3 text-amber-700 shrink-0" />,
          label: 'MODELLED',
        };
    }
  };

  const { bg, icon, label } = getBadgeStyle();

  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-medium ${bg} ${className}`}>
      {icon}
      <span className="font-extrabold uppercase tracking-wider">{label}</span>
      <span className="text-slate-300">•</span>
      <span className="font-semibold truncate max-w-[200px] sm:max-w-none">{source}</span>
      {segmentId && (
        <>
          <span className="text-slate-300">•</span>
          <span className="text-slate-600">{segmentName ? `${segmentName} (${segmentId})` : segmentId}</span>
        </>
      )}
      {confidence !== undefined && (
        <>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-[10px] font-bold">{(confidence * 100).toFixed(0)}% Conf</span>
        </>
      )}
      {verificationStatus && (
        <>
          <span className="text-slate-300">•</span>
          <span className="text-[10px] uppercase font-bold">{verificationStatus}</span>
        </>
      )}
      {lastUpdated && (
        <>
          <span className="text-slate-300">•</span>
          <span className="text-slate-500 text-[10px]">{lastUpdated}</span>
        </>
      )}
    </div>
  );
}
