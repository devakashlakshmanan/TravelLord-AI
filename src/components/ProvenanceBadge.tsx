import React from 'react';
import { Database } from 'lucide-react';

interface ProvenanceBadgeProps {
  source: string;
  segmentName: string;
  segmentId: string;
}

export default function ProvenanceBadge({ source, segmentName, segmentId }: ProvenanceBadgeProps) {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100/90 border border-slate-200 text-[11px] font-medium text-slate-600">
      <Database className="w-3 h-3 text-slate-400 shrink-0" />
      <span className="text-slate-500">Source:</span>
      <span className="font-semibold text-slate-700 truncate max-w-[240px] sm:max-w-none">{source}</span>
      <span className="text-slate-300">•</span>
      <span className="text-slate-500">{segmentName} ({segmentId})</span>
    </div>
  );
}
